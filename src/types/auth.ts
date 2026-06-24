export interface User {
  id: number;
  uuid?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  mobile?: string;
  role?: string;
  organisationId?: number | null;
  hasOrganisation?: boolean;
  /** Transient — set from register flow via sessionStorage */
  pendingOrgName?: string;
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

export const PENDING_ORG_NAME_KEY = 'pendingOrgName';
