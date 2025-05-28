import fastifyMonitor, { type DevPerformanceOptions } from "@rhinolabs/fastify-monitor";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";

/**
 * Development performance monitoring plugin that automatically tracks request timing
 * and identifies slow endpoints. Only active in development mode (NODE_ENV=development).
 *
 * For configuration options, see: https://www.npmjs.com/package/@rhinolabs/fastify-monitor
 */
export const monitorPlugin = fp(async (fastify: FastifyInstance, options: DevPerformanceOptions = {}) => {
  const defaultOptions: DevPerformanceOptions = {
    slowThreshold: 1000,     // Log slow requests after 1000ms
    verySlowThreshold: 3000, // Log very slow requests after 3000ms

    // Default exclusions for common monitoring and asset endpoints
    excludePaths: [
      "/health",
      "/ready",
      "/metrics",
      "/docs/*",
      "/swagger/*",
      "/favicon.ico",
      // Static assets using RegExp
      /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|pdf|zip)$/,
    ],
  };

  const mergedOptions: DevPerformanceOptions = { ...defaultOptions, ...options };

  await fastify.register(fastifyMonitor, mergedOptions as FastifyPluginOptions);
});
