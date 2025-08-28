import helmet, { type FastifyHelmetOptions } from "@fastify/helmet";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type { BoilrPluginOptions } from "../core/config.js";
import { mergeConfigRecursively } from "../utils/config.utils.js";

/**
 * Helmet security plugin that adds essential HTTP security headers to protect against
 * common web vulnerabilities. Configured with sensible defaults for API development.
 *
 * For configuration options, see: https://www.npmjs.com/package/@fastify/helmet
 */
export const helmetPlugin = fp(async (fastify: FastifyInstance, options: BoilrPluginOptions<FastifyHelmetOptions>) => {
  const { boilrConfig } = options;

  const defaultOptions: FastifyHelmetOptions = {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
      },
    },
  };

  if (boilrConfig?.plugins?.helmet === false) {
    return;
  }

  let helmetConfig = {};
  if (typeof boilrConfig?.plugins?.helmet === "object") {
    helmetConfig = boilrConfig.plugins.helmet;
  }

  const mergedOptions = mergeConfigRecursively(defaultOptions, helmetConfig);

  await fastify.register(helmet, mergedOptions);
});
