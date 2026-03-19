import { OpenAPIHono } from "@hono/zod-openapi";
import { type BoilrConfig, mergeConfig } from "./core/config.js";
import { registerFileRoutes } from "./core/router.js";
import { type BoilrInstance, createServer } from "./core/server.js";
import { createGlobalExceptionHandler } from "./exceptions/handler.js";
import { applyGlobalMiddleware } from "./middleware/index.js";
import { registerPlugins } from "./plugins/index.js";
import type { BoilrEnv } from "./types/env.types.js";

/**
 * Creates a new BoilrJs application instance with the specified configuration.
 * This is the main entry point for creating BoilrJs applications.
 *
 * @param userConfig - Optional configuration object to customize the application
 * @returns A configured BoilrJs application instance ready to be started
 *
 * @example
 * ```typescript
 * // Basic usage with defaults
 * const app = createApp();
 *
 * // With custom configuration
 * const app = createApp({
 *   server: {
 *     port: 8080,
 *     host: "localhost"
 *   },
 *   routes: {
 *     dir: "./src/api",
 *     prefix: "/api/v1"
 *   },
 *   plugins: {
 *     swagger: {
 *       info: {
 *         title: "My API",
 *         version: "1.0.0"
 *       }
 *     }
 *   },
 *   exceptions: {
 *     formatter: (exception, request) => ({
 *       statusCode: exception.statusCode,
 *       message: exception.message,
 *       error: exception.name.replace("Exception", ""),
 *       details: exception.details
 *     }),
 *     logErrors: true
 *   }
 * });
 *
 * // Start the server
 * await app.start();
 * ```
 */
export const createApp = (userConfig: BoilrConfig = {}): BoilrInstance => {
  const config = mergeConfig(userConfig);

  const app = new OpenAPIHono<BoilrEnv>();

  // Inject boilrConfig into all requests via middleware
  app.use(async (c, next) => {
    c.set("boilrConfig", config);
    c.set("requestId", crypto.randomUUID());
    await next();
  });

  // Register all plugins as middleware
  registerPlugins(app, config);

  // Register middleware
  if (config.middleware?.global) {
    for (const middleware of config.middleware.global) {
      applyGlobalMiddleware(app, middleware);
    }
  }

  // Set up global exception handler
  const exceptionHandler = createGlobalExceptionHandler({
    formatter: config.exceptions?.formatter,
    logErrors: config.exceptions?.logErrors,
  });
  app.onError(exceptionHandler);

  // Start route registration — returns a promise that start() will await
  const routesReady = registerFileRoutes(app, config);

  return createServer(app, config, routesReady);
};
