import path from "node:path";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { registerRoutes } from "./route-loader.js";
import { extractRouteInfo, scanDirectories } from "./scanner.js";
import type { FastifyInstance, FileRoutesOptions } from "./types.js";

const pluginImpl: FastifyPluginAsync<FileRoutesOptions> = async (
  fastify: FastifyInstance,
  options: FileRoutesOptions,
): Promise<void> => {
  if (!options.routesDir) {
    throw new Error("routesDir option is required");
  }

  const routesDir = path.isAbsolute(options.routesDir)
    ? options.routesDir
    : path.join(process.cwd(), options.routesDir);

  const scanOptions = {
    ignore: options.options?.ignore || [/node_modules/, /\.(test|spec)\./],
    extensions: options.options?.extensions || [".js", ".cjs", ".mjs", ".ts"],
  };

  const routeFiles = await scanDirectories(routesDir, scanOptions);
  const routes = extractRouteInfo(routeFiles, routesDir, options.options?.pathTransform);

  if (options.prefix) {
    for (const route of routes) {
      route.routePath = path.posix.join(options.prefix, route.routePath);
    }
  }

  await registerRoutes(fastify, routes, options.options?.globalHooks);

  fastify.log.info(`Registered ${routes.length} routes from ${routesDir}`);
};

export const fastifyFileRoutes = fp(pluginImpl, {
  fastify: "5.x",
  name: "boilr-file-routes",
});