import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { HttpException, InternalServerErrorException, ValidationException } from "./exceptions.js";
import { defaultFormatter } from "./formatter.js";
import type { ExceptionConfig, ValidationMiddlewareOptions } from "./interfaces.js";
import type { ValidationErrorBase, ZodError } from "./validation.js";

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
export function createGlobalExceptionHandler(config?: ExceptionConfig) {
  const { logErrors = true } = config || {};

  return async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    let exception: HttpException;

    if (error instanceof HttpException) {
      exception = error;
    } else if (isValidationError(error)) {
      exception = createValidationException(error);
    } else {
      const errorLike = error as Error;
      exception = new InternalServerErrorException(errorLike.message || "Internal server error", {
        errorCode: "INTERNAL_ERROR",
      });
    }

    if (logErrors) {
      logError(exception, request, error);
    }

    const formatter = config?.formatter || defaultFormatter;
    const response = await formatter(exception, request, reply);

    return reply.code(exception.statusCode).send(response);
  };
}

/**
 * Creates middleware that catches and formats validation errors.
 * This middleware transforms validation errors into ValidationException instances.
 *
 * @param options - Configuration options for validation handling
 * @returns Fastify middleware function
 *
 * @example
 * ```typescript
 * const middleware = createValidationMiddleware({ errorLimit: 5 });
 * app.addHook('preHandler', middleware);
 * ```
 */
export function createValidationMiddleware(options: ValidationMiddlewareOptions = {}) {
  const { errorLimit = 10 } = options;

  return async (request: FastifyRequest, reply: FastifyReply, done: () => Promise<void>) => {
    try {
      await done();
    } catch (error: unknown) {
      if (isValidationError(error)) {
        throw formatValidationError(error, { errorLimit });
      }
      throw error;
    }
  };
}

/**
 * Creates a handler function for processing validation errors.
 * Converts validation errors from various sources into ValidationException instances.
 *
 * @param options - Configuration options for validation handling
 * @returns Function that processes validation errors
 *
 * @example
 * ```typescript
 * const handler = createValidationHandler({ errorLimit: 5 });
 * try {
 *   // validation logic
 * } catch (error) {
 *   handler(error);
 * }
 * ```
 */
export function createValidationHandler(options: ValidationMiddlewareOptions = {}) {
  const { errorLimit = 10 } = options;

  return (error: ValidationErrorBase) => {
    if (error.name === "ZodError" && error.issues) {
      throw ValidationException.fromZodError(error as ZodError);
    }

    if (error.validation) {
      const errors = error.validation.slice(0, errorLimit).map((issue) => ({
        field: issue.instancePath || issue.dataPath || "unknown",
        message: issue.message || "Validation failed",
        value: issue.data,
      }));

      throw new ValidationException("Validation failed", errors, {
        errorCode: "VALIDATION_ERROR",
      });
    }

    throw new ValidationException(error.message || "Validation failed", undefined, {
      errorCode: "VALIDATION_ERROR",
    });
  };
}

function isValidationError(error: unknown): error is ValidationErrorBase {
  const typedError = error as ValidationErrorBase;
  return !!(
    typedError.validation ||
    typedError.validationContext ||
    typedError.name === "ZodError" ||
    typedError.code?.startsWith("FST_ERR_VALIDATION")
  );
}

function createValidationException(error: ValidationErrorBase): ValidationException {
  if (error.name === "ZodError" && error.issues) {
    return ValidationException.fromZodError(error as ZodError);
  }

  if (error.validation) {
    const errors = error.validation.map((issue) => ({
      field: issue.instancePath || issue.dataPath || "unknown",
      message: issue.message || "Validation failed",
      value: issue.data,
    }));

    return new ValidationException("Validation failed", errors, {
      errorCode: "VALIDATION_ERROR",
    });
  }

  return new ValidationException(error.message || "Validation failed", undefined, {
    errorCode: "VALIDATION_ERROR",
  });
}

function formatValidationError(error: ValidationErrorBase, options: ValidationMiddlewareOptions): ValidationException {
  if (error.name === "ZodError" && error.issues) {
    return ValidationException.fromZodError(error as ZodError);
  }

  if (error.validation) {
    const errors = error.validation.slice(0, options.errorLimit || 10).map((issue) => ({
      field: issue.instancePath || issue.dataPath || "unknown",
      message: issue.message || "Validation failed",
      value: issue.data,
    }));

    return new ValidationException("Validation failed", errors, {
      errorCode: "VALIDATION_ERROR",
    });
  }

  return new ValidationException(error.message || "Validation failed", undefined, {
    errorCode: "VALIDATION_ERROR",
  });
}

function logError(exception: HttpException, request: FastifyRequest, originalError?: Error) {
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
}
