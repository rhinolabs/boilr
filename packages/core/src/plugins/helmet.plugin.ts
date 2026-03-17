import type { MiddlewareHandler } from "hono";
import { secureHeaders } from "hono/secure-headers";
import type { BoilrConfig } from "../core/config.js";
import type { BoilrEnv } from "../types/fastify.types.js";

export const createHelmetMiddleware = (config: BoilrConfig): MiddlewareHandler<BoilrEnv> => {
  if (typeof config.plugins?.helmet === "object") {
    // Pass through config — secureHeaders accepts its own options
    return secureHeaders(config.plugins.helmet as Parameters<typeof secureHeaders>[0]);
  }

  return secureHeaders();
};
