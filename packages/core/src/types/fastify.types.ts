/**
 * Type declarations for BoilrJs framework.
 * Defines the Hono environment types used throughout the framework.
 */

import type { BoilrConfig } from "../core/config.js";
import type { BoilrAuthContext } from "./auth.types.js";

/**
 * Hono environment type for BoilrJs applications.
 * Defines Variables (context state) and Bindings (Cloudflare environment).
 */
export type BoilrEnv = {
  Bindings: Record<string, unknown>;
  Variables: {
    boilrConfig: BoilrConfig;
    ctx: BoilrAuthContext;
    requestId: string;
  };
};
