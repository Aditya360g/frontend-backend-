import apiClient from "../api/apiClient";

import type { ApiResponse } from "../types/api";

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
} from "../types/auth";

import {
  unwrapApiResponse,
} from "../utils/unwrapApiResponse";

async function login(
  request: LoginRequest,
): Promise<LoginResponse> {
  const response =
    await apiClient.post<
      ApiResponse<LoginResponse>
    >(
      "/auth/login",
      request,
    );

  return unwrapApiResponse(
    response.data,
  );
}

async function register(
  request: RegisterRequest,
): Promise<User> {
  const response =
    await apiClient.post<
      ApiResponse<User>
    >(
      "/auth/register",
      request,
    );

  return unwrapApiResponse(
    response.data,
  );
}

async function forgotPassword(
  email: string,
): Promise<void> {
  await apiClient.post<
    ApiResponse<null>
  >(
    "/auth/forgot-password",
    {
      email,
    },
  );
}

async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  await apiClient.post<
    ApiResponse<null>
  >(
    "/auth/reset-password",
    {
      token,
      newPassword,
    },
  );
}

async function verifyEmail(
  token: string,
): Promise<void> {
  await apiClient.get<
    ApiResponse<null>
  >(
    "/auth/verify-email",
    {
      params: {
        token,
      },
    },
  );
}

async function resendEmailVerification(
  email: string,
): Promise<void> {
  await apiClient.post<
    ApiResponse<null>
  >(
    "/auth/resend-verification",
    {
      email,
    },
  );
}

async function logout(): Promise<void> {
  await apiClient.post<
    ApiResponse<null>
  >(
    "/auth/logout",
  );
}

export const authService = {
  login,
  register,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerification,
  logout,
};