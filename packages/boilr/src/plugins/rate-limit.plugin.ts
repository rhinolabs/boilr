import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { mergeConfigRecursively } from "../utils/config.utils.js";

/**
 * Context information provided to rate limit error response builder.
 */
interface RateLimitContext {
  /** Time string indicating when the client can retry */
  after: string;
  /** Maximum number of requests allowed in the time window */
  max: number;
}

/**
 * Rate limiting plugin that prevents abuse by limiting the number of requests
 * per client within a specified time window. Includes helpful error messages.
 *
 * For configuration options, see: https://www.npmjs.com/package/@fastify/rate-limit
 */
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

  const mergedOptions = mergeConfigRecursively(defaultOptions, options);

  await fastify.register(rateLimit, mergedOptions);
});
