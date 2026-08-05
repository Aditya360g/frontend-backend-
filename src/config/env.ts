const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim();

export const env = {
  apiBaseUrl:
    configuredApiBaseUrl ||
    "http://localhost:8080/api/v1",
} as const;