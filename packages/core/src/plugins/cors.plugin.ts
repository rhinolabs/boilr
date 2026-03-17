import type { MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import type { BoilrConfig, BoilrCorsConfig } from "../core/config.js";
import type { BoilrEnv } from "../types/fastify.types.js";

export function createCorsMiddleware(config: BoilrConfig): MiddlewareHandler<BoilrEnv> {
  const defaultOptions: BoilrCorsConfig = {
    origin: "*",
    allowMethods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
    credentials: true,
  };

  let corsConfig: BoilrCorsConfig = {};
  if (typeof config.plugins?.cors === "object") {
    corsConfig = config.plugins.cors;
  }

  return cors({
    origin: corsConfig.origin ?? defaultOptions.origin ?? "*",
    allowMethods: corsConfig.allowMethods ?? defaultOptions.allowMethods,
    allowHeaders: corsConfig.allowHeaders,
    maxAge: corsConfig.maxAge,
    credentials: corsConfig.credentials ?? defaultOptions.credentials,
    exposeHeaders: corsConfig.exposeHeaders,
  });
}
