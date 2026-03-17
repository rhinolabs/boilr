import path from "node:path";
import type { OpenAPIHono } from "@hono/zod-openapi";
import type { ExceptionConfig } from "../../types/error.types.js";
import type { BoilrEnv } from "../../types/fastify.types.js";
import type { FileRoutesOptions } from "../../types/file-routes.types.js";
import { registerRoutes } from "./route-loader.js";
import { extractRouteInfo, scanDirectories } from "./scanner.js";

export interface HonoFileRoutesOptions extends FileRoutesOptions {
  exceptionsConfig?: ExceptionConfig;
}

export async function honoFileRoutes(app: OpenAPIHono<BoilrEnv>, options: HonoFileRoutesOptions): Promise<void> {
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

  await registerRoutes(app, routes, options.exceptionsConfig);

  console.log(`Registered ${routes.length} routes from ${routesDir}`);
}
