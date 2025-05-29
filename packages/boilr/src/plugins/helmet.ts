import helmet from "@fastify/helmet";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";

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
