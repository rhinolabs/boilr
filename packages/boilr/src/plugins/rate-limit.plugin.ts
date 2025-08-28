import rateLimit, { type RateLimitPluginOptions } from "@fastify/rate-limit";
import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import type { BoilrPluginOptions } from "../core/config.js";
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
export const rateLimitPlugin = fp(
  async (fastify: FastifyInstance, options: BoilrPluginOptions<RateLimitPluginOptions>) => {
    const { boilrConfig } = options;

    const defaultOptions: RateLimitPluginOptions = {
      max: 100,
      timeWindow: "1 minute",
      errorResponseBuilder: (req: FastifyRequest, context: RateLimitContext) => ({
        statusCode: 429,
        error: "Too Many Requests",
        message: `Rate limit exceeded, retry in ${context.after}`,
      }),
    };

    if (boilrConfig?.plugins?.rateLimit === false) {
      return;
    }

    let rateLimitConfig = {};
    if (typeof boilrConfig?.plugins?.rateLimit === "object") {
      rateLimitConfig = boilrConfig.plugins.rateLimit;
    }

    const mergedOptions = mergeConfigRecursively(defaultOptions, rateLimitConfig);

    await fastify.register(rateLimit, mergedOptions);
  },
);
