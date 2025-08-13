// Import type extensions for Fastify (module augmentation)
import "./types/fastify.js";

// Export main implementation from boilr
export { createApp } from "./boilr.js";

// Export from other modules
export { BoilrConfig } from "./core/config.js";
export { registerMiddleware, createRouteMiddleware } from "./middleware/index.js";
export { BoilrInstance } from "./core/server.js";
export {
  ZodTypeProvider,
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform,
  createJsonSchemaTransformObject,
} from "./validation/index.js";

// Export exception handling system
export {
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  MethodNotAllowedException,
  NotAcceptableException,
  RequestTimeoutException,
  ConflictException,
  GoneException,
  PreconditionFailedException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
  ImATeapotException,
  UnprocessableEntityException,
  InternalServerErrorException,
  NotImplementedException,
  BadGatewayException,
  ServiceUnavailableException,
  GatewayTimeoutException,
  HttpVersionNotSupportedException,
  ValidationException,
  defaultFormatter,
  createGlobalExceptionHandler,
  createValidationHandler,
  createValidationMiddleware,
  HttpStatusCode,
} from "./exceptions/index.js";

export type {
  ErrorResponse,
  ErrorFormatter,
  ExceptionOptions,
  ExceptionConfig,
  ValidationError,
} from "./types/error.types.js";

// Export route types and utils
export {
  RouteSchema,
  HttpMethod,
  MethodSchema,
  TypedRequest,
  RouteHandler,
  GetHandler,
  PostHandler,
  PutHandler,
  DeleteHandler,
  PatchHandler,
  HeadHandler,
  OptionsHandler,
  defineSchema,
  PathSegments,
  CatchAllParam,
  catchAllSchema,
} from "./types/routes.types.js";

export {
  getTypedParams,
  getTypedQuery,
  getTypedBody,
  getCatchAllParam,
} from "./utils/routes.utils.js";
