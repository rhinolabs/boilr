import type { FastifyReply, FastifyRequest } from "fastify";
import type { HttpException } from "./exceptions.js";
import type { ErrorFormatter, ErrorResponse } from "./interfaces.js";

/**
 * Default error formatter for HTTP exceptions.
 * Formats exceptions into a consistent JSON response structure.
 *
 * @param exception - The HTTP exception to format
 * @param request - The Fastify request object
 * @param reply - The Fastify reply object
 * @returns Formatted error response object
 *
 * @example
 * ```typescript
 * // Response format:
 * {
 *   status: 404,
 *   message: "User not found",
 *   error: "NotFound",
 *   details: { userId: "123" }
 * }
 * ```
 */
export const defaultFormatter: ErrorFormatter = (
  exception: HttpException,
  request: FastifyRequest,
  reply: FastifyReply,
): ErrorResponse => ({
  status: exception.statusCode,
  message: exception.message,
  error: exception.name.replace("Exception", ""),
  details: exception.details,
});
