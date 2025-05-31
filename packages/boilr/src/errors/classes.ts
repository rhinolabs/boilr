/**
 * Standard error classes for Boilr applications.
 * Each error class automatically maps to the appropriate HTTP status code.
 */

/**
 * NotFoundError - Automatically returns HTTP 404
 * Use when a requested resource cannot be found.
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * ValidationError - Automatically returns HTTP 400
 * Use for input validation failures and invalid data.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * BadRequestError - Automatically returns HTTP 400
 * Use for malformed requests and invalid operations.
 */
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

/**
 * UnauthorizedError - Automatically returns HTTP 401
 * Use when authentication is required but missing or invalid.
 */
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * ForbiddenError - Automatically returns HTTP 403
 * Use when user is authenticated but lacks required permissions.
 */
export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * ConflictError - Automatically returns HTTP 409
 * Use when the request conflicts with current server state.
 */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
