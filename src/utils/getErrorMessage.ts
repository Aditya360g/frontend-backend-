import axios from "axios";

import type {
  BackendErrorResponse,
  ValidationError,
} from "../types/api";

function getValidationMessage(
  validationErrors?: ValidationError[]
): string | undefined {
  if (
    !validationErrors ||
    validationErrors.length === 0
  ) {
    return undefined;
  }

  return validationErrors
    .map((validationError) => {
      if (
        validationError.field &&
        validationError.message
      ) {
        return `${validationError.field}: ${validationError.message}`;
      }

      return validationError.message;
    })
    .filter(Boolean)
    .join(", ");
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage = "Something went wrong."
): string {
  if (
    axios.isAxiosError<BackendErrorResponse>(
      error
    )
  ) {
    const validationMessage =
      getValidationMessage(
        error.response?.data?.validationErrors
      );

    return (
      validationMessage ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallbackMessage
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}