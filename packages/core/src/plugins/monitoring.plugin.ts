import fastifyMonitor, { type PerformanceMonitorOptions } from "@rhinolabs/fastify-monitor";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type { BoilrPluginOptions } from "../core/config.js";
import { mergeConfigRecursively } from "../utils/config.utils.js";

/**
 * Development performance monitoring plugin that automatically tracks request timing
 * and identifies slow endpoints.
 *
 * For configuration options, see: https://www.npmjs.com/package/@rhinolabs/fastify-monitor
 */
export const monitorPlugin = fp(
  async (fastify: FastifyInstance, options: BoilrPluginOptions<PerformanceMonitorOptions>) => {
    const { boilrConfig } = options;

    const defaultOptions: PerformanceMonitorOptions = {
      slowThreshold: 1000, // Log slow requests after 1000ms
      verySlowThreshold: 3000, // Log very slow requests after 3000ms

      // Default exclusions for common monitoring and asset endpoints
      exclude: [
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

    if (boilrConfig?.plugins?.monitor === false) {
      return;
    }

    let monitorConfig = {};
    if (typeof boilrConfig?.plugins?.monitor === "object") {
      monitorConfig = boilrConfig.plugins.monitor;
    }

    const mergedOptions = mergeConfigRecursively(defaultOptions, monitorConfig);

    await fastify.register(fastifyMonitor, mergedOptions);
  },
);
