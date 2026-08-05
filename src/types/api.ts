export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  path?: string;
  requestId?: string;
}

export interface ValidationError {
  field?: string;
  message?: string;
}

export interface BackendErrorResponse {
  success?: boolean;
  message?: string;
  error?: string;
  code?: string;
  validationErrors?: ValidationError[];
}