import path from "node:path";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { registerRoutes } from "./route-loader.js";
import { extractRouteInfo, scanDirectories } from "./scanner.js";
import type { FastifyInstance, FileRoutesOptions } from "./types.js";

/**
 * Main plugin implementation
 */
const pluginImpl: FastifyPluginAsync<FileRoutesOptions> = async (
  fastify: FastifyInstance,
  options: FileRoutesOptions,
): Promise<void> => {
  // Validate required options
  if (!options.routesDir) {
    throw new Error("routesDir option is required");
  }

  // Get an absolute path to routes directory
  const routesDir = path.isAbsolute(options.routesDir)
    ? options.routesDir
    : path.join(process.cwd(), options.routesDir);

  // Configure options with defaults
  const scanOptions = {
    ignore: options.options?.ignore || [/node_modules/, /\.(test|spec)\./],
    extensions: options.options?.extensions || [".js", ".cjs", ".mjs", ".ts"],
  };

  // Scan for route files
  const routeFiles = await scanDirectories(routesDir, scanOptions);

  // Extract route information
  const routes = extractRouteInfo(routeFiles, routesDir, options.options?.pathTransform);

  // Apply route prefix if provided
  if (options.prefix) {
    for (const route of routes) {
      route.routePath = path.posix.join(options.prefix, route.routePath);
    }
  }

  // Register routes with Fastify
  await registerRoutes(fastify, routes, options.options?.globalHooks);

  // Log registration summary
  fastify.log.info(`Registered ${routes.length} routes from ${routesDir}`);
};

/**
 * The Fastify file routes plugin
 */
export const fastifyFileRoutes = fp(pluginImpl, {
  fastify: "5.x",
  name: "@rhinolabs/fastify-file-routes",
});
