export { fastifyFileRoutes } from "./file-routes.js";
export type {
  FileRoutesOptions,
  RouteInfo,
  RouteModule,
  RouteSchema,
  HttpMethod,
  RouteHandler,
  FastifyInstance,
  FastifyPluginAsync,
} from "../../types/file-routes.types.js";
export { scanDirectories, extractRouteInfo, transformPathToRoute, handleDynamicSegments } from "./scanner.js";
export { loadRouteModule, extractMethodHandlers, registerRoutes } from "./route-loader.js";
