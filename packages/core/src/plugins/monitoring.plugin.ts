import type { MiddlewareHandler } from "hono";
import type { BoilrConfig, BoilrMonitorConfig } from "../core/config.js";
import type { BoilrEnv } from "../types/fastify.types.js";

export function createMonitorMiddleware(config: BoilrConfig): MiddlewareHandler<BoilrEnv> {
  const defaultOptions: BoilrMonitorConfig = {
    slowThreshold: 1000,
    verySlowThreshold: 3000,
    exclude: ["/health", "/ready", "/metrics", "/docs", "/openapi.json", "/favicon.ico"],
  };

  let monitorConfig: BoilrMonitorConfig = {};
  if (typeof config.plugins?.monitor === "object") {
    monitorConfig = config.plugins.monitor;
  }

  const slowThreshold = monitorConfig.slowThreshold ?? defaultOptions.slowThreshold ?? 1000;
  const verySlowThreshold = monitorConfig.verySlowThreshold ?? defaultOptions.verySlowThreshold ?? 3000;
  const excludePatterns = monitorConfig.exclude ?? defaultOptions.exclude ?? [];

  return async (c, next) => {
    const url = c.req.path;

    // Check exclusions
    for (const pattern of excludePatterns) {
      if (typeof pattern === "string" && (url === pattern || url.startsWith(`${pattern}/`))) {
        await next();
        return;
      }
      if (pattern instanceof RegExp && pattern.test(url)) {
        await next();
        return;
      }
    }

    const start = Date.now();
    await next();
    const duration = Date.now() - start;

    if (duration >= verySlowThreshold) {
      console.warn(`[VERY SLOW] ${c.req.method} ${url} took ${duration}ms`);
    } else if (duration >= slowThreshold) {
      console.warn(`[SLOW] ${c.req.method} ${url} took ${duration}ms`);
    }
  };
}
