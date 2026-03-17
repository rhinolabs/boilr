import type { Context } from "hono";
import type { ExceptionConfig, ValidationErrorBase, ZodError } from "../types/error.types.js";
import type { BoilrEnv } from "../types/env.types.js";
import { HttpException, InternalServerErrorException, ValidationException } from "./exceptions.js";
import { defaultFormatter } from "./formatter.js";

const isValidationError = (error: unknown): error is ValidationErrorBase => {
  const typedError = error as ValidationErrorBase;
  return !!(
    typedError.validation ||
    typedError.validationContext ||
    typedError.name === "ZodError" ||
    typedError.code?.startsWith?.("FST_ERR_VALIDATION")
  );
};

const createValidationException = (error: ValidationErrorBase) => {
  if (error.name === "ZodError" && error.issues) {
    return ValidationException.fromZodError(error as ZodError);
  }

  if (error.validation) {
    const errors = error.validation.map((issue) => ({
      field: issue.instancePath || issue.dataPath || "unknown",
      message: issue.message || "Validation failed",
      value: issue.data,
    }));

    return new ValidationException("Validation failed", {
      name: "ValidationError",
      details: errors,
    });
  }

  return new ValidationException(error.message || "Validation failed", {
    name: "ValidationError",
  });
};

const logError = (exception: HttpException, url: string, method: string, originalError?: Error) => {
  const logData: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level: exception.statusCode >= 500 ? "error" : "warn",
    message: exception.message,
    statusCode: exception.statusCode,
    path: url,
    method,
    details: exception.details,
  };

  if (originalError && originalError !== exception) {
    logData.originalError = originalError.message;
  }

  if (exception.statusCode >= 500) {
    console.error("HTTP Exception:", logData);
  } else {
    console.warn("HTTP Exception:", logData);
  }
};

/**
 * Creates a global exception handler for BoilrJs applications.
 * This handler catches and formats all HTTP exceptions and validation errors.
 *
 * @param config - Optional configuration for exception handling
 * @returns Error handler function compatible with the application instance
 *
 * @example
 * ```typescript
 * const handler = createGlobalExceptionHandler({
 *   logErrors: true,
 *   formatter: customFormatter
 * });
 * app.onError(handler);
 * ```
 */
export const createGlobalExceptionHandler = (config?: ExceptionConfig) => {
  const { logErrors = true } = config || {};

  return async (error: Error, c: Context<BoilrEnv>): Promise<Response> => {
    let exception: HttpException;

    if (error instanceof HttpException) {
      exception = error;
    } else if (isValidationError(error)) {
      exception = createValidationException(error);
    } else {
      exception = new InternalServerErrorException(error.message || "Internal server error", {
        name: "InternalServerError",
      });
    }

    if (logErrors) {
      logError(exception, c.req.url, c.req.method, error);
    }

    const formatter = config?.formatter || defaultFormatter;
    const response = await formatter(exception, { url: c.req.url, method: c.req.method });

    return c.json(response, exception.statusCode as 200);
  };
};
