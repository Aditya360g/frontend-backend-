import {
  createContext,
} from "react";

import type {
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/auth";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (
    request: LoginRequest
  ) => Promise<void>;

  registerUser: (
    request: RegisterRequest
  ) => Promise<void>;

  logout: () => Promise<void>;

  refreshCurrentUser:
    () => Promise<void>;

  setCurrentUser:
    (user: User) => void;
}

export const AuthContext =
  createContext<AuthContextValue | null>(
    null
  );