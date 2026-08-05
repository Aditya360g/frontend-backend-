import apiClient from "../api/apiClient";

import type { ApiResponse } from "../types/api";

import type {
  ChangePasswordRequest,
  Session,
  UpdateProfileRequest,
  User,
} from "../types/auth";

import {
  unwrapApiResponse,
} from "../utils/unwrapApiResponse";

async function getCurrentUser(): Promise<User> {
  const response =
    await apiClient.get<ApiResponse<User>>(
      "/users/me",
    );

  return unwrapApiResponse(
    response.data,
  );
}

async function updateCurrentUser(
  request: UpdateProfileRequest,
): Promise<User> {
  const response =
    await apiClient.put<ApiResponse<User>>(
      "/users/me",
      request,
    );

  return unwrapApiResponse(
    response.data,
  );
}

async function changePassword(
  request: ChangePasswordRequest,
): Promise<void> {
  await apiClient.put<ApiResponse<null>>(
    "/users/me/password",
    request,
  );
}

async function getActiveSessions(): Promise<Session[]> {
  const response =
    await apiClient.get<ApiResponse<Session[]>>(
      "/users/me/sessions",
    );

  return unwrapApiResponse(
    response.data,
  );
}

async function revokeSession(
  sessionId: number,
): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(
    `/users/me/sessions/${sessionId}`,
  );
}

async function revokeOtherSessions(): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(
    "/users/me/sessions/others",
  );
}

export const userService = {
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  getActiveSessions,
  revokeSession,
  revokeOtherSessions,
};