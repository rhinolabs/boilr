import type { MiddlewareHandler } from "hono";
import { secureHeaders } from "hono/secure-headers";
import type { BoilrConfig } from "../core/config.js";
import type { BoilrEnv } from "../types/env.types.js";

/**
 * Security headers middleware that adds essential HTTP security headers to protect against
 * common web vulnerabilities. Configured with sensible defaults for API development.
 */
export const createHelmetMiddleware = (config: BoilrConfig): MiddlewareHandler<BoilrEnv> => {
  if (typeof config.plugins?.helmet === "object") {
    // Pass through config — secureHeaders accepts its own options
    return secureHeaders(config.plugins.helmet as Parameters<typeof secureHeaders>[0]);
  }

  return secureHeaders();
};
