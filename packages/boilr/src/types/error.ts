import type { FastifyRequest } from "fastify";

/**
 * Custom error formatter function type.
 * Allows users to customize the HTTP error response format.
 *
 * @param error - The thrown error instance
 * @param statusCode - The mapped HTTP status code
 * @param request - The Fastify request object for context
 * @returns The custom error response object
 *
 * @example
 * ```typescript
 * const customFormatter: ErrorFormatter = (error, statusCode, request) => ({
 *   success: false,
 *   errorMessage: error.message,
 *   code: statusCode,
 *   timestamp: Date.now(),
 *   path: request.url
 * });
 * ```
 */
export type ErrorFormatter = (error: Error, statusCode: number, request: FastifyRequest) => unknown;
