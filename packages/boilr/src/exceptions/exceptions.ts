import type { ExceptionOptions, ValidationError, ZodError } from "../types/error.types.js";

/**
 * Base class for all HTTP exceptions in Boilr applications.
 * Provides a consistent structure for HTTP error responses with status codes.
 *
 * @example
 * ```typescript
 * class CustomException extends HttpException {
 *   constructor(message: string) {
 *     super(message, 418, { errorCode: 'CUSTOM_ERROR' });
 *     this.name = 'CustomException';
 *   }
 * }
 * ```
 */
export abstract class HttpException extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, options?: ExceptionOptions) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = options?.name;
    this.details = options?.details;

    if (options?.cause) {
      this.cause = options.cause;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Exception for HTTP 400 Bad Request errors.
 * Thrown when the request is malformed or contains invalid data.
 *
 * @example
 * ```typescript
 * throw new BadRequestException('Invalid request format');
 * ```
 */
export class BadRequestException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 400, options);
    this.name = "BadRequest";
  }
}

/**
 * Exception for HTTP 401 Unauthorized errors.
 * Thrown when authentication is required but not provided or invalid.
 *
 * @example
 * ```typescript
 * throw new UnauthorizedException('Authentication required');
 * ```
 */
export class UnauthorizedException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 401, options);
    this.name = "Unauthorized";
  }
}

/**
 * Exception for HTTP 403 Forbidden errors.
 * Thrown when the user is authenticated but lacks permission.
 *
 * @example
 * ```typescript
 * throw new ForbiddenException('Insufficient permissions');
 * ```
 */
export class ForbiddenException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 403, options);
    this.name = "Forbidden";
  }
}

/**
 * Exception for HTTP 404 Not Found errors.
 * Thrown when a requested resource cannot be found.
 *
 * @example
 * ```typescript
 * throw new NotFoundException('User not found');
 * ```
 */
export class NotFoundException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 404, options);
    this.name = "NotFound";
  }
}

export class MethodNotAllowedException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 405, options);
    this.name = "MethodNotAllowed";
  }
}

export class NotAcceptableException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 406, options);
    this.name = "NotAcceptable";
  }
}

export class RequestTimeoutException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 408, options);
    this.name = "RequestTimeout";
  }
}

export class ConflictException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 409, options);
    this.name = "Conflict";
  }
}

export class GoneException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 410, options);
    this.name = "Gone";
  }
}

export class PreconditionFailedException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 412, options);
    this.name = "PreconditionFailed";
  }
}

export class PayloadTooLargeException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 413, options);
    this.name = "PayloadTooLarge";
  }
}

export class UnsupportedMediaTypeException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 415, options);
    this.name = "UnsupportedMediaType";
  }
}

export class ImATeapotException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 418, options);
    this.name = "ImATeapot";
  }
}

export class UnprocessableEntityException extends HttpException {
  public readonly errors?: ValidationError[];

  constructor(message: string, errors?: ValidationError[], options?: ExceptionOptions) {
    super(message, 422, options);
    this.name = "UnprocessableEntity";
    this.errors = errors;
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 500, options);
    this.name = "InternalServerError";
  }
}

export class NotImplementedException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 501, options);
    this.name = "NotImplemented";
  }
}

export class BadGatewayException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 502, options);
    this.name = "BadGateway";
  }
}

export class ServiceUnavailableException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 503, options);
    this.name = "ServiceUnavailable";
  }
}

export class GatewayTimeoutException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 504, options);
    this.name = "GatewayTimeout";
  }
}

export class HttpVersionNotSupportedException extends HttpException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, 505, options);
    this.name = "HttpVersionNotSupported";
  }
}

/**
 * Exception for validation errors with detailed field-level information.
 * Extends UnprocessableEntityException to provide structured validation error data.
 *
 * @example
 * ```typescript
 * const errors = [{ field: 'email', message: 'Invalid email format', value: 'invalid-email' }];
 * throw new ValidationException('Validation failed', errors);
 *
 * // From Zod error
 * throw ValidationException.fromZodError(zodError);
 * ```
 */
export class ValidationException extends BadRequestException {
  constructor(message: string, options?: ExceptionOptions) {
    super(message, options);
    this.name = "ValidationError";
  }

  static fromZodError(zodError: ZodError): ValidationException {
    const errors: ValidationError[] =
      zodError.issues?.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        value: issue.received,
      })) || [];

    return new ValidationException("Validation failed", {
      name: "ValidationError",
      details: errors,
    });
  }
}
