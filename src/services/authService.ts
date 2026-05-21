import api from '../lib/Axios';
import type { LoginRequest, AuthResponse } from '../types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/login', credentials);
    return data;
  },

  async me(): Promise<AuthResponse> {
    const { data } = await api.get<AuthResponse>('/me');
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/logout');
  }
};
