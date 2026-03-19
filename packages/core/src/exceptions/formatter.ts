import type { ErrorFormatter, ErrorResponse } from "../types/error.types.js";
import type { HttpException } from "./exceptions.js";

/**
 * Default error formatter for HTTP exceptions.
 * Formats exceptions into a consistent JSON response structure.
 *
 * @param exception - The HTTP exception to format
 * @param request - The request metadata object
 * @returns Formatted error response object
 *
 * @example
 * ```typescript
 * // Response format:
 * {
 *   statusCode: 404,
 *   message: "User not found",
 *   error: "NotFound",
 *   details: { userId: "123" }
 * }
 * ```
 */
export const defaultFormatter: ErrorFormatter = (
  exception: HttpException,
  _request: { url: string; method: string },
): ErrorResponse => ({
  statusCode: exception.statusCode,
  message: exception.message,
  error: exception.name,
  details: exception.details,
});
