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

/**
 * Type alias for objects that resemble validation errors.
 * Used for type checking validation error objects from various sources.
 */
export type ValidationErrorLike = ValidationErrorBase;
