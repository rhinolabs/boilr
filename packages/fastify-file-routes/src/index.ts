// Export the main plugin
export { fastifyFileRoutes } from "./plugin.js";

// Export types
export type {
  FileRoutesOptions,
  RouteHandler,
  HttpMethod,
  RouteSchema,
} from "./types.js";

// Export default for convenience
import { fastifyFileRoutes } from "./plugin.js";
export default fastifyFileRoutes;
