export type {
  FastifyInstance,
  FastifyPluginAsync,
  FileRoutesOptions,
  HttpMethod,
  RouteHandler,
  RouteInfo,
  RouteModule,
  RouteSchema,
} from "../../types/file-routes.types.js";
export { fastifyFileRoutes } from "./file-routes.js";
export { extractMethodHandlers, loadRouteModule, registerRoutes } from "./route-loader.js";
export { extractRouteInfo, handleDynamicSegments, scanDirectories, transformPathToRoute } from "./scanner.js";
