import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

interface RateLimitContext {
  after: string;
  max: number;
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
