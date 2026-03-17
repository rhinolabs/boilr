import { OpenAPIHono } from "@hono/zod-openapi";
import { type BoilrConfig, mergeConfig } from "./core/config.js";
import { registerFileRoutes } from "./core/router.js";
import { type BoilrInstance, createServer } from "./core/server.js";
import { createGlobalExceptionHandler } from "./exceptions/handler.js";
import { applyGlobalMiddleware } from "./middleware/index.js";
import { registerPlugins } from "./plugins/index.js";
import type { BoilrEnv } from "./types/env.types.js";

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
