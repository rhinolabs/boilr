// Import type extensions for Fastify (module augmentation)
import "./types/fastify.types.js";

console.warn(`
╔════════════════════════════════════════════════════════════╗
║  ⚠️  DEPRECATION WARNING                                   ║
║                                                            ║
║  @rhinolabs/boilr has been renamed to @boilrjs/core        ║
║                                                            ║
║  Please update your package.json                           ║
║  npm uninstall @rhinolabs/boilr                            ║
║  npm install @boilrjs/core                                 ║
╚════════════════════════════════════════════════════════════╝
`);

// Export main implementation from boilr
export { createApp } from "./boilr.js";

// Export from other modules
export { BoilrConfig } from "./core/config.js";
export {
  registerMiddleware,
  createRouteMiddleware,
} from "./middleware/index.js";
export { BoilrInstance } from "./core/server.js";
export {
  ZodTypeProvider,
  validatorCompiler,
  serializerCompiler,
  createJsonSchemaTransform,
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

export { DefaultErrorSchema } from "./schemas/error.schema.js";

// Export authentication system
export {
  extractBearerToken,
  extractApiKey,
  extractBasicCredentials,
  validateAuthMethod,
  validateAuthMethods,
} from "./core/auth/index.js";

export type {
  AuthType,
  AuthLocation,
  AuthMethodOptions,
  AuthMethod,
  AuthValidator,
  AuthConfig,
  BasicCredentials,
  BoilrAuthContext,
} from "./types/auth.types.js";
