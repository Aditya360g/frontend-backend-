import type { ApiResponse } from "../types/api";

function isApiResponse<T>(
  value: ApiResponse<T> | T
): value is ApiResponse<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    "data" in value
  );
}

export function unwrapApiResponse<T>(
  responseBody: ApiResponse<T> | T
): T {
  if (isApiResponse(responseBody)) {
    return responseBody.data;
  }

  return responseBody;
}