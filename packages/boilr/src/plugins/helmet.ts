import helmet from "@fastify/helmet";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";

/**
 * Helmet security plugin that adds essential HTTP security headers to protect against
 * common web vulnerabilities. Configured with sensible defaults for API development.
 *
 * For configuration options, see: https://www.npmjs.com/package/@fastify/helmet
 */
export const helmetPlugin = fp(async (fastify: FastifyInstance, options: FastifyPluginOptions = {}) => {
  const defaultOptions = {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
      },
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  await fastify.register(helmet, mergedOptions);
});
