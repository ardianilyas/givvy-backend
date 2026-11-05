export const ERROR_STATUS_CODE = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404
} as const;

export const ERROR_MESSAGE = {
  BAD_REQUEST: "Bad Request",
  VALIDATION_ERROR: "Validation Error",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Resource not found",
} as const;
