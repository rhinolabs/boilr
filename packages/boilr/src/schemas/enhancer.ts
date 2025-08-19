import type { ZodType } from "zod";
import type { ExceptionConfig } from "../types/error.types.js";
import type { MethodSchema } from "../types/routes.types.js";
import { DEFAULT_ERROR_CODES, createMultipleErrorSchemas } from "./error.schema.js";

/**
 * Validates if status codes should be processed or skipped
 */
const shouldSkipErrorSchemas = (statusCodes: number[] | false | undefined): boolean => {
  return statusCodes === false || !statusCodes || (Array.isArray(statusCodes) && statusCodes.length === 0);
};

/**
 * Enhances a method schema by adding error responses for specified status codes.
 * Respects the method-level defaultErrorStatusCodes setting.
 *
 * @param methodSchema - The method schema to enhance
 * @param errorSchemas - Record of status codes to error schemas
 * @param defaultStatusCodes - Array of default status codes to add (if not overridden by method config)
 * @returns Enhanced method schema with error responses
 */
const enhanceMethodSchema = (
  methodSchema: MethodSchema,
  errorSchemas: Record<number, ZodType<unknown>>,
  defaultStatusCodes: number[],
): MethodSchema => {
  // Determine which status codes to include for this method
  const methodStatusCodes = methodSchema.defaultErrorStatusCodes ?? defaultStatusCodes;

  // If method explicitly disables error schemas, skip
  if (methodStatusCodes === false || (Array.isArray(methodStatusCodes) && methodStatusCodes.length === 0)) {
    return methodSchema;
  }

  const statusCodesToUse = Array.isArray(methodStatusCodes) ? methodStatusCodes : defaultStatusCodes;
  const newResponses: Record<string, ZodType<unknown>> = {};

  // Add error schemas for each status code that doesn't already exist
  for (const statusCode of statusCodesToUse) {
    const statusKey = statusCode.toString();
    const schema = errorSchemas[statusCode];
    const hasExistingResponse = methodSchema.response && statusKey in methodSchema.response;
    if (!hasExistingResponse && schema) {
      newResponses[statusKey] = schema;
    }
  }

  // If no new responses to add, return unchanged
  if (Object.keys(newResponses).length === 0) {
    return methodSchema;
  }

  return {
    ...methodSchema,
    response: {
      ...methodSchema.response,
      ...newResponses,
    },
  };
};

/**
 * Enhances route schemas with automatic error responses for specified status codes.
 * Processes all HTTP methods in the schema and adds error response schemas
 * based on configuration.
 *
 * @param schema - The route schema to enhance
 * @param config - Exception configuration containing defaultErrorStatusCodes and formatting options
 * @returns Enhanced route schema with error responses added where appropriate
 *
 * @example
 * ```typescript
 * const enhancedSchema = enhanceSchemaWithDefaultError(originalSchema, {
 *   defaultErrorStatusCodes: [400, 401, 404, 500],
 *   formatterSchema: customErrorSchema
 * });
 * ```
 */
export const enhanceSchemaWithDefaultError = (schema: MethodSchema, config?: ExceptionConfig): MethodSchema => {
  // Get status codes from config or use defaults
  const statusCodes = config?.defaultErrorStatusCodes ?? DEFAULT_ERROR_CODES;

  // If no valid status codes, return unchanged
  if (shouldSkipErrorSchemas(statusCodes)) {
    return schema;
  }

  const validStatusCodes = statusCodes as number[];

  // Create error schemas with optional custom schema from config
  const customSchema = config?.formatter && config?.formatterSchema ? config.formatterSchema : undefined;
  const errorSchemas = createMultipleErrorSchemas(validStatusCodes, customSchema);

  return enhanceMethodSchema(schema, errorSchemas, validStatusCodes);
};
