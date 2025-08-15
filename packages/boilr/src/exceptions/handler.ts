import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import type {
  ExceptionConfig,
  ValidationErrorBase,
  ZodError,
} from "../types/error.types.js";
import { HttpException, InternalServerErrorException, ValidationException } from "./exceptions.js";
import { defaultFormatter } from "./formatter.js";

const isValidationError = (error: unknown): error is ValidationErrorBase => {
  const typedError = error as ValidationErrorBase;
  return !!(
    typedError.validation ||
    typedError.validationContext ||
    typedError.name === "ZodError" ||
    typedError.code?.startsWith("FST_ERR_VALIDATION")
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
      details: errors
    });
  }

  return new ValidationException(error.message || "Validation failed", {
    name: "ValidationError",
  });
};

const logError = (exception: HttpException, request: FastifyRequest, originalError?: Error) => {
  const logData: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level: exception.statusCode >= 500 ? "error" : "warn",
    message: exception.message,
    status: exception.statusCode,
    path: request.url,
    method: request.method,
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
 * Creates a global exception handler for Fastify applications.
 * This handler catches and formats all HTTP exceptions and validation errors.
 *
 * @param config - Optional configuration for exception handling
 * @returns Fastify error handler function
 *
 * @example
 * ```typescript
 * const handler = createGlobalExceptionHandler({
 *   logErrors: true,
 *   formatter: customFormatter
 * });
 * app.setErrorHandler(handler);
 * ```
 */
export const createGlobalExceptionHandler = (config?: ExceptionConfig) => {
  const { logErrors = true } = config || {};
  
  return async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    let exception: HttpException;

    if (error instanceof HttpException) {
      exception = error;
    } else if (isValidationError(error)) {
      exception = createValidationException(error);
    } else {
      exception = new InternalServerErrorException((error as Error).message || "Internal server error", {
        name: "InternalServerError",
      });
    }
    
    if (logErrors) {
      logError(exception, request, error);
    }

    const formatter = config?.formatter || defaultFormatter;
    const response = await formatter(exception, request, reply);

    return reply.code(exception.statusCode).send(response);
  };
};
