// Export main implementation from core
export { createApp } from "./boilr.js";
// Export authentication system
export {
  extractApiKey,
  extractBasicCredentials,
  extractBearerToken,
  validateAuthMethod,
  validateAuthMethods,
} from "./core/auth/index.js";
// Export config and server types
export { BoilrConfig } from "./core/config.js";
export { BoilrInstance } from "./core/server.js";
// Export exception handling system
export {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  createGlobalExceptionHandler,
  defaultFormatter,
  ForbiddenException,
  GatewayTimeoutException,
  GoneException,
  HttpException,
  HttpStatusCode,
  HttpVersionNotSupportedException,
  ImATeapotException,
  InternalServerErrorException,
  MethodNotAllowedException,
  NotAcceptableException,
  NotFoundException,
  NotImplementedException,
  PayloadTooLargeException,
  PreconditionFailedException,
  RequestTimeoutException,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
  ValidationException,
} from "./exceptions/index.js";
export {
  createRouteMiddleware,
  registerMiddleware,
} from "./middleware/index.js";
export { DefaultErrorSchema } from "./schemas/error.schema.js";
export type {
  AuthConfig,
  AuthLocation,
  AuthMethod,
  AuthMethodOptions,
  AuthType,
  AuthValidator,
  BasicCredentials,
  BoilrAuthContext,
  BoilrRequest,
} from "./types/auth.types.js";
export type {
  ErrorFormatter,
  ErrorResponse,
  ExceptionConfig,
  ExceptionOptions,
  ValidationError,
} from "./types/error.types.js";
// Export Hono environment type
export { BoilrEnv } from "./types/fastify.types.js";
// Export route types and utils
export {
  CatchAllParam,
  catchAllSchema,
  DeleteHandler,
  defineSchema,
  GetHandler,
  HeadHandler,
  HttpMethod,
  MethodSchema,
  OptionsHandler,
  PatchHandler,
  PathSegments,
  PostHandler,
  PutHandler,
  RouteHandler,
  RouteSchema,
  TypedReply,
  TypedRequest,
} from "./types/routes.types.js";
export {
  getCatchAllParam,
  getTypedBody,
  getTypedParams,
  getTypedQuery,
} from "./utils/routes.utils.js";
