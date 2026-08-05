export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: "selfb_access_token",
  USER: "selfb_authenticated_user",
} as const;

export const AUTH_EVENTS = {
  UNAUTHORIZED: "auth:unauthorized",
} as const;