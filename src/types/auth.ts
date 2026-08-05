export type UserRole =
  | "USER"
  | "ADMIN"
  | string;

export interface User {
  id: number | string;
  name: string;
  email: string;
  role?: UserRole;
  roles?: UserRole[];
  phone?: string | null;
  bio?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn?: number;
  tokenType?: string;
  user?: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn?: number;
  tokenType?: string;
}

export interface UpdateProfileRequest {
  name: string;
  phone?: string;
  bio?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Session {
  sessionId: number;
  tokenFamilyId: string;
  ipAddress: string | null;
  userAgent: string | null;
  signedInAt: string;
  lastActivityAt: string;
  expiresAt: string;
  currentSession: boolean;
}