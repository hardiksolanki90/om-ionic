export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
}
