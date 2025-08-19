import type { FastifyReply, FastifyRequest } from "fastify";
import type { ZodType, z } from "zod";
import type { HttpException } from "../exceptions/index.js";

/**
 * Standard error response format for HTTP exceptions.
 * This interface defines the structure of error responses sent to clients.
 */
export interface ErrorResponse {
  /** HTTP status code (e.g., 400, 404, 500) */
  status: number;
  /** Human-readable error message */
  message: string;
  /** Error type name (e.g., "BadRequest", "NotFound") */
  error: string;
  /** Additional error details or validation errors */
  details: unknown;
}

/**
 * Options for configuring HTTP exceptions.
 */
export interface ExceptionOptions {
  /** Custom error name for application-specific error handling */
  name?: string;
  /** Additional details to include in the error response */
  details?: unknown;
  /** The underlying error that caused this exception */
  cause?: Error;
}

/**
 * Represents a single validation error for a specific field.
 */
export interface ValidationError {
  /** The field name or path that failed validation */
  field: string;
  /** Human-readable validation error message */
  message: string;
  /** The invalid value that was provided */
  value?: unknown;
}

/**
 * Function type for customizing error response formatting.
 *
 * @param exception - The HTTP exception that was thrown
 * @param request - The Fastify request object
 * @param reply - The Fastify reply object
 * @returns The formatted error response object
 *
 * @example
 * ```typescript
 * const customFormatter: ErrorFormatter = (exception, request, reply) => ({
 *   status: exception.statusCode,
 *   message: exception.message,
 *   error: exception.name.replace("Exception", ""),
 *   details: exception.details
 * });
 * ```
 */
export type ErrorFormatter<T = ErrorResponse> = (
  exception: HttpException,
  request: FastifyRequest,
  reply: FastifyReply,
) => T | Promise<T>;

/**
 * Global configuration for exception handling in Boilr applications.
 */
export interface ExceptionConfig<TSchema extends ZodType = ZodType<ErrorResponse>> {
  /** Custom error formatter function to control response structure */
  formatter?: ErrorFormatter<z.infer<TSchema>>;
  /** Whether to log errors to console (default: true) */
  logErrors?: boolean;
  /**
   * HTTP status codes for which to automatically include default error response schemas in all routes.
   * Provide an array of status codes to include default error schemas for, or false to disable completely.
   *
   * @default [500] - Only include 500 Internal Server Error by default
   *
   * @example
   * ```typescript
   * defaultErrorStatusCodes: [400, 401, 403, 404, 500] // Include multiple error schemas
   * defaultErrorStatusCodes: [] // Disable all default error schemas
   * defaultErrorStatusCodes: false // Disable all default error schemas
   * defaultErrorStatusCodes: [500] // Only server errors (default)
   * ```
   */
  defaultErrorStatusCodes?: number[] | false;
  /**
   * Zod schema that defines the structure returned by the custom formatter.
   * The formatter's return type will be automatically inferred from this schema.
   * If not provided, uses the default error response schema.
   *
   * @example
   * ```typescript
   * const config: ExceptionConfig<typeof customSchema> = {
   *   formatterSchema: z.object({
   *     success: z.boolean(),
   *     error: z.string(),
   *     message: z.string(),
   *     timestamp: z.string()
   *   }),
   *   formatter: (exception, request, reply) => ({
   *     success: false,
   *     error: exception.name,
   *     message: exception.message,
   *     timestamp: new Date().toISOString()
   *   })
   * }
   * ```
   */
  formatterSchema?: TSchema;
}

/**
 * Represents a validation issue from JSON Schema or similar validators.
 */
export interface ValidationIssue {
  /** The path to the invalid property (JSON Pointer format) */
  instancePath?: string;
  /** Alternative path format for the invalid property */
  dataPath?: string;
  /** Human-readable validation error message */
  message?: string;
  /** The invalid data that caused the validation error */
  data?: unknown;
}

/**
 * Represents a validation issue from Zod schema validation.
 */
export interface ZodIssue {
  /** Array representing the path to the invalid field */
  path: string[];
  /** Human-readable validation error message */
  message: string;
  /** The invalid value that was received */
  received?: unknown;
}

/**
 * Error object structure from Zod validation failures.
 */
export interface ZodError extends Error {
  /** Always "ZodError" for Zod validation errors */
  name: "ZodError";
  /** Array of individual validation issues */
  issues?: ZodIssue[];
}

/**
 * Base interface for validation errors from various sources.
 * This interface accommodates different validation libraries and formats.
 */
export interface ValidationErrorBase extends Error {
  /** Array of validation issues (JSON Schema format) */
  validation?: ValidationIssue[];
  /** Context or scope where validation failed */
  validationContext?: string;
  /** Error code from the validation library */
  code?: string;
  /** Array of validation issues (Zod format) */
  issues?: ZodIssue[];
}
