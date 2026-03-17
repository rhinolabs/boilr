import type { ZodType } from "zod";
import type { HttpException } from "../exceptions/index.js";

/**
 * Standard error response format for HTTP exceptions.
 */
export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  details: unknown;
}

export interface ExceptionOptions {
  name?: string;
  details?: unknown;
  cause?: Error;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Framework-agnostic error formatter.
 * Receives the exception and request metadata for formatting.
 */
export type ErrorFormatter<T = ErrorResponse> = (
  exception: HttpException,
  request: { url: string; method: string },
) => T | Promise<T>;

export interface ExceptionConfig {
  formatter?: ErrorFormatter<unknown>;
  logErrors?: boolean;
  defaultErrorStatusCodes?: number[] | false;
  formatterSchema?: ZodType<unknown>;
}

export interface ValidationIssue {
  instancePath?: string;
  dataPath?: string;
  message?: string;
  data?: unknown;
}

export interface ZodIssue {
  path: string[];
  message: string;
  received?: unknown;
}

export interface ZodError extends Error {
  name: "ZodError";
  issues?: ZodIssue[];
}

export interface ValidationErrorBase extends Error {
  validation?: ValidationIssue[];
  validationContext?: string;
  code?: string;
  issues?: ZodIssue[];
}
