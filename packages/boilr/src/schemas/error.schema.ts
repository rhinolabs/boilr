import { z } from "zod";

/**
 * Default error response schema structure that matches the default error formatter.
 * This is the base schema used for all error status codes.
 *
 * @example
 * ```typescript
 * {
 *   status: 500,
 *   message: "Internal server error",
 *   error: "InternalServerError",
 *   details: undefined
 * }
 * ```
 */
export const DefaultErrorSchema = z.object({
  status: z.number(),
  message: z.string(),
  error: z.string(),
  details: z.unknown().optional(),
});

/**
 * Creates a generic error response schema for any HTTP status code.
 * Useful for creating consistent error schemas across different status codes.
 *
 * @param statusCode - The HTTP status code for this error schema
 * @returns Zod schema for error responses with the specified status code
 *
 * @example
 * ```typescript
 * const notFoundSchema = createErrorResponseSchema(404);
 * const badRequestSchema = createErrorResponseSchema(400);
 * ```
 */
export const createErrorResponseSchema = (statusCode: number) => {
  return z.object({
    status: z.literal(statusCode),
    message: z.string(),
    error: z.string(),
    details: z.unknown().optional(),
  });
};

/**
 * Creates error response schemas for multiple status codes.
 * Returns a record with status codes as keys and schemas as values.
 *
 * @param statusCodes - Array of HTTP status codes to create schemas for
 * @param customSchema - Optional custom schema to use instead of default
 * @returns Record mapping status codes to their error schemas
 *
 * @example
 * ```typescript
 * const errorSchemas = createMultipleErrorSchemas([400, 401, 404, 500]);
 * // Returns: { 400: Schema, 401: Schema, 404: Schema, 500: Schema }
 * ```
 */
export const createMultipleErrorSchemas = (
  statusCodes: number[],
  customSchema?: z.ZodType<unknown>,
): Record<number, z.ZodType<unknown>> => {
  const schemas: Record<number, z.ZodType<unknown>> = {};

  for (const statusCode of statusCodes) {
    schemas[statusCode] = customSchema || createErrorResponseSchema(statusCode);
  }

  return schemas;
};

/**
 * Default error status codes to include when none are specified
 */
export const DEFAULT_ERROR_CODES = [500];
