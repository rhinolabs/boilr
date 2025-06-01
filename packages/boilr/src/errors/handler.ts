import type { FastifyReply, FastifyRequest } from "fastify";
import type { ErrorFormatter } from "../types/error.js";

// Import type extensions for Fastify
import "../types/fastify.js";

/**
 * Immutable object that maps error class names directly to their HTTP status codes.
 * Using Object.freeze() ensures the mapping cannot be mutated at runtime.
 */
const ErrorStatusCode = Object.freeze({
  NotFoundError: 404,
  ValidationError: 400,
  BadRequestError: 400,
  UnauthorizedError: 401,
  ForbiddenError: 403,
  ConflictError: 409,
} as const);

/**
 * Type alias for error status code keys for better readability
 */
type ErrorStatusCodeKey = keyof typeof ErrorStatusCode;

/**
 * Default error formatter that follows Boilr's standard error response format.
 * Returns a consistent JSON structure with error name, message, and status code.
 *
 * @param error - The error instance
 * @param statusCode - The HTTP status code
 * @returns Standard error response object
 */
const defaultErrorFormatter: ErrorFormatter = (error, statusCode) => ({
  error: error.name.replace("Error", ""),
  message: error.message,
  statusCode,
});

/**
 * Global error handler for Boilr applications.
 * Automatically maps error types to HTTP status codes and formats responses.
 *
 * @param error - The thrown error
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 */
export const globalErrorHandler = (error: Error, request: FastifyRequest, reply: FastifyReply): void => {
  // Get status code directly from enum or default to 500 (type-safe)
  const statusCode = ErrorStatusCode[error.name as ErrorStatusCodeKey] || 500;

  // Get custom formatter from config or use default
  const formatter = request.server.boilrConfig?.errorFormatter || defaultErrorFormatter;

  // Format the error response
  const response = formatter(error, statusCode, request);

  // Send the formatted error response
  reply.code(statusCode).send(response);
};
