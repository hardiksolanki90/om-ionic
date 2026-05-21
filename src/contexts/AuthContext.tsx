import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import api from '../lib/Axios';
import type { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Fetch CSRF cookie from Sanctum before login
// Vite proxy routes /sanctum/* → om-laravel.test/sanctum/*
export const fetchCsrfCookie = () =>
  axios.get('/sanctum/csrf-cookie', { withCredentials: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount — cookie sent automatically (withCredentials)
  useEffect(() => {
    const controller = new AbortController();
    (api.get('/admin/me', { signal: controller.signal }) as any)
      .then((res: any) => setUser(res.user))
      .catch((err: any) => {
        // CanceledError = StrictMode cleanup abort — not a real failure
        if (err.name === 'CanceledError') return;
        // 401 = no active session — stay on login, no action needed
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  const login = async (credentials: { email: string; password?: string }) => {
    const res: any = await api.post('/admin/login', credentials);
    setUser(res.user);
    // No token stored — session managed by HttpOnly cookie
  };

  const logout = async () => {
    try {
      await api.post('/admin/logout');
    } catch {
      // Session may already be expired — ignore
    }
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
