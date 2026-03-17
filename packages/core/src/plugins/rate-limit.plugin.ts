import type { MiddlewareHandler } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import type { BoilrConfig, BoilrRateLimitConfig } from "../core/config.js";
import type { BoilrEnv } from "../types/fastify.types.js";

export const createRateLimitMiddleware = (config: BoilrConfig): MiddlewareHandler<BoilrEnv> => {
  const defaultOptions: BoilrRateLimitConfig = {
    max: 100,
    windowMs: 60_000,
  };

  let rateLimitConfig: BoilrRateLimitConfig = {};
  if (typeof config.plugins?.rateLimit === "object") {
    rateLimitConfig = config.plugins.rateLimit;
  }

  const max = rateLimitConfig.max ?? defaultOptions.max ?? 100;
  const windowMs = rateLimitConfig.windowMs ?? defaultOptions.windowMs ?? 60_000;

  return rateLimiter({
    windowMs,
    limit: max,
    keyGenerator: (c) => c.req.header("x-forwarded-for") || c.req.header("cf-connecting-ip") || "unknown",
  });
};
