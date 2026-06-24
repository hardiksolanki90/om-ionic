import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import axios from 'axios';
import api from '../lib/Axios';
import type { User } from '../types/auth';
import { PENDING_ORG_NAME_KEY } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUserFromRegister: (user: User, orgName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const fetchCsrfCookie = () =>
  axios.get('/sanctum/csrf-cookie', {
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
  });

function enrichUser(raw: User): User {
  const pendingOrgName = sessionStorage.getItem(PENDING_ORG_NAME_KEY) ?? undefined;
  return { ...raw, pendingOrgName };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const res: { user: User } = await api.get('/admin/me');
    setUser(enrichUser(res.user));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    (api.get('/admin/me', { signal: controller.signal }) as Promise<{ user: User }>)
      .then((res) => {
        setUser(enrichUser(res.user));
        setIsLoading(false);
      })
      .catch((err: { name?: string }) => {
        if (err.name === 'CanceledError') return;
        setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const login = async (credentials: { email: string; password?: string }) => {
    const res: { user: User } = await api.post('/admin/login', credentials);
    setUser(enrichUser(res.user));
  };

  const setUserFromRegister = (registeredUser: User, orgName: string) => {
    sessionStorage.setItem(PENDING_ORG_NAME_KEY, orgName);
    setUser(enrichUser(registeredUser));
  };

  const logout = async () => {
    try {
      await api.post('/admin/logout');
    } catch {
      // Session may already be expired
    }
    sessionStorage.removeItem(PENDING_ORG_NAME_KEY);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
      setUserFromRegister,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
