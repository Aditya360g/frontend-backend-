import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  AUTH_EVENTS,
} from "../constants/auth";

import { authService } from "../services/authService";
import { userService } from "../services/userService";
import { authStorage } from "../storage/authStorage";

import type {
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/auth";

import {
  AuthContext,
  type AuthContextValue,
} from "./auth-context";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(
      authStorage.getUser
    );

  const [loading, setLoading] =
    useState(true);

  const setCurrentUser = useCallback(
    (currentUser: User) => {
      setUser(currentUser);
      authStorage.setUser(currentUser);
    },
    []
  );

  const clearAuthentication =
    useCallback(() => {
      authStorage.clear();
      setUser(null);
    }, []);

  const refreshCurrentUser =
    useCallback(async () => {
      const currentUser =
        await userService.getCurrentUser();

      setCurrentUser(currentUser);
    }, [setCurrentUser]);

  const login = useCallback(
    async (request: LoginRequest) => {
      const loginResponse =
        await authService.login(request);

      if (!loginResponse.accessToken) {
        throw new Error(
          "Backend did not return an access token."
        );
      }

      authStorage.setAccessToken(
        loginResponse.accessToken
      );

      if (loginResponse.user) {
        setCurrentUser(
          loginResponse.user
        );

        return;
      }

      await refreshCurrentUser();
    },
    [
      refreshCurrentUser,
      setCurrentUser,
    ]
  );

  const registerUser = useCallback(
    async (
      request: RegisterRequest
    ) => {
      await authService.register(request);
    },
    []
  );

  const logout = useCallback(
    async () => {
      try {
        await authService.logout();
      } finally {
        clearAuthentication();
      }
    },
    [clearAuthentication]
  );

  useEffect(() => {
    const initializeAuthentication =
      async () => {
        const accessToken =
          authStorage.getAccessToken();

        if (!accessToken) {
          clearAuthentication();
          setLoading(false);
          return;
        }

        try {
          await refreshCurrentUser();
        } catch {
          clearAuthentication();
        } finally {
          setLoading(false);
        }
      };

    void initializeAuthentication();
  }, [
    clearAuthentication,
    refreshCurrentUser,
  ]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuthentication();
    };

    window.addEventListener(
      AUTH_EVENTS.UNAUTHORIZED,
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        AUTH_EVENTS.UNAUTHORIZED,
        handleUnauthorized
      );
    };
  }, [clearAuthentication]);

  const contextValue =
    useMemo<AuthContextValue>(
      () => ({
        user,
        loading,
        isAuthenticated:
          Boolean(user),
        login,
        registerUser,
        logout,
        refreshCurrentUser,
        setCurrentUser,
      }),
      [
        user,
        loading,
        login,
        registerUser,
        logout,
        refreshCurrentUser,
        setCurrentUser,
      ]
    );

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
}