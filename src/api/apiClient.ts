import axios from "axios";

import { env } from "../config/env";
import { AUTH_EVENTS } from "../constants/auth";
import { authStorage } from "../storage/authStorage";

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const requestUrl =
      config.url ?? "";

    const isCookieAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/logout");

    if (isCookieAuthRequest) {
      config.headers.delete(
        "Authorization",
      );

      return config;
    }

    const accessToken =
      authStorage.getAccessToken();

    if (accessToken) {
      config.headers.set(
        "Authorization",
        `Bearer ${accessToken}`,
      );
    }

    return config;
  },

  (error: unknown) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,

  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status =
      error.response?.status;

    const requestUrl =
      error.config?.url ?? "";

    const isPublicAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/logout");

    if (
      status === 401 &&
      !isPublicAuthRequest
    ) {
      authStorage.clear();

      window.dispatchEvent(
        new Event(
          AUTH_EVENTS.UNAUTHORIZED,
        ),
      );
    }

    return Promise.reject(error);
  },
);

export default apiClient;