/**
 * Type declarations for Boilr framework extensions to Fastify.
 * This file extends Fastify's interfaces to include Boilr-specific decorators.
 */

import type { BoilrConfig } from "../core/config.js";

declare module "fastify" {
  interface FastifyInstance {
    /**
     * Boilr configuration object stored on the Fastify instance.
     * This is decorated automatically when using createApp().
     */
    boilrConfig: BoilrConfig;
  }

  interface FastifyRequest {
    /**
     * Authentication context set by the auth system.
     * Contains the result of the successful auth validator.
     */
    ctx?: any;
  }
}

// biome-ignore lint/complexity/noUselessEmptyExport: Export empty object to make this a module
export {};
