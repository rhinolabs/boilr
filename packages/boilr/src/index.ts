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
} from "./types/route-types.js";

export {
  getTypedParams,
  getTypedQuery,
  getTypedBody,
  getCatchAllParam,
} from "./utils/route-utils.js";
