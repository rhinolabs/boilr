import type { OpenAPIHono } from "@hono/zod-openapi";
import type { BoilrConfig } from "../core/config.js";
import type { BoilrEnv } from "../types/fastify.types.js";
import { createAuthMiddleware } from "./auth.plugin.js";
import { createCorsMiddleware } from "./cors.plugin.js";
import { createHelmetMiddleware } from "./helmet.plugin.js";
import { createMonitorMiddleware } from "./monitoring.plugin.js";
import { createRateLimitMiddleware } from "./rate-limit.plugin.js";
import { registerSwagger } from "./swagger.plugin.js";

export const registerPlugins = (app: OpenAPIHono<BoilrEnv>, config: BoilrConfig): void => {
  if (config.plugins?.helmet !== false) {
    app.use(createHelmetMiddleware(config));
  }

  if (config.plugins?.cors !== false) {
    app.use(createCorsMiddleware(config));
  }

  if (config.plugins?.rateLimit !== false) {
    app.use(createRateLimitMiddleware(config));
  }

  if (config.plugins?.monitor !== false) {
    app.use(createMonitorMiddleware(config));
  }

  if (config.plugins?.swagger !== false) {
    registerSwagger(app, config);
  }

  // Auth middleware must come after other middleware
  if (config.auth) {
    app.use(createAuthMiddleware(config));
  }
};
