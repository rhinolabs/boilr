import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { RouteOptions } from "fastify";
import type { FastifyInstance, HttpMethod, RouteHandler, RouteInfo, RouteModule } from "./types";

/**
 * Load a route module dynamically using ESM imports
 *
 * @param filePath - The file path of the module
 * @returns The loaded route module
 */
export async function loadRouteModule(filePath: string): Promise<RouteModule | null> {
  try {
    // Check if file exists
    if (!existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return null;
    }

    try {
      // Use dynamic import with file URL to load ESM module
      const fileUrl = pathToFileURL(filePath).href;
      const imported = await import(fileUrl);
      return imported as RouteModule;
    } catch (error) {
      console.error(`Error importing ESM module: ${filePath}`, error);
      return null;
    }
  } catch (error) {
    console.error(`Error importing route module from ${filePath}:`, error);
    return null;
  }
}

/**
 * Extract HTTP method handlers from a route module
 *
 * @param routeModule - The route module
 * @param filePath - The file path (for logging)
 * @returns Map of HTTP methods to handlers
 */
export function extractMethodHandlers(routeModule: RouteModule, filePath: string): Map<HttpMethod, RouteHandler> {
  const handlers = new Map<HttpMethod, RouteHandler>();

  // Check for named exports matching HTTP methods
  const methods: HttpMethod[] = ["get", "post", "put", "delete", "patch", "head", "options"];

  for (const method of methods) {
    if (typeof routeModule[method] === "function") {
      handlers.set(method, routeModule[method] as RouteHandler);
    }
  }

  // Handle default export as function
  if (typeof routeModule.default === "function") {
    // If no other handlers are defined, use default for GET
    if (handlers.size === 0) {
      handlers.set("get", routeModule.default as RouteHandler);
    }
  }
  // Handle default export as object with method handlers
  else if (routeModule.default && typeof routeModule.default === "object") {
    for (const [key, value] of Object.entries(routeModule.default)) {
      if (isHttpMethod(key) && typeof value === "function") {
        handlers.set(key as HttpMethod, value as RouteHandler);
      }
    }
  }

  return handlers;
}

/**
 * Check if a string is a valid HTTP method
 *
 * @param method - The method string to check
 * @returns Whether the string is a valid HTTP method
 */
function isHttpMethod(method: string): method is HttpMethod {
  return ["get", "post", "put", "delete", "patch", "head", "options"].includes(method);
}

/**
 * Register routes with a Fastify instance
 *
 * @param fastify - The Fastify instance
 * @param routes - The routes to register
 * @param globalHooks - Global hooks to apply to all routes
 */
export async function registerRoutes(
  fastify: FastifyInstance,
  routes: RouteInfo[],
  globalHooks: Partial<RouteOptions> = {},
): Promise<void> {
  for (const route of routes) {
    try {
      const module = await loadRouteModule(route.filePath);

      if (!module) {
        fastify.log.warn(`Failed to load route module: ${route.filePath}`);
        continue;
      }

      const methodHandlers = extractMethodHandlers(module, route.filePath);

      for (const [method, handler] of methodHandlers.entries()) {
        const routeOptions: RouteOptions = {
          method: method.toUpperCase(),
          url: route.routePath,
          handler,
          ...globalHooks,
        };

        // Add hooks from the route module if present
        if (module.hooks) {
          Object.assign(routeOptions, module.hooks);
        }

        // Add schema from the route module if present for this method
        if (module.schema?.[method]) {
          routeOptions.schema = module.schema[method];
        }

        // Register the route
        fastify.route(routeOptions);
        fastify.log.debug(`Registered route: ${method.toUpperCase()} ${route.routePath}`);
      }
    } catch (error) {
      fastify.log.error(`Failed to register route from file: ${route.filePath}`, error);
    }
  }
}
