import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";
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

interface RateLimitContext {
  after: string;
  max: number;
  [key: string]: any;
}

export const rateLimitPlugin = fp(async (fastify: FastifyInstance, options: FastifyPluginOptions = {}) => {
  const defaultOptions = {
    max: 100,
    timeWindow: "1 minute",
    errorResponseBuilder: (req: FastifyRequest, context: RateLimitContext) => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: `Rate limit exceeded, retry in ${context.after}`,
    }),
  };

  const mergedOptions = { ...defaultOptions, ...options };

  await fastify.register(rateLimit, mergedOptions);
});
