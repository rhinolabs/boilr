import cors, { type FastifyCorsOptions } from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

/**
 * CORS (Cross-Origin Resource Sharing) plugin that configures cross-origin request
 * handling with sensible defaults for API development.
 *
 * For configuration options, see: https://www.npmjs.com/package/@fastify/cors
 */
export const corsPlugin = fp(async (fastify: FastifyInstance, options: FastifyCorsOptions = {}) => {
  const defaultOptions = {
    origin: true,
    methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
    credentials: true,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  await fastify.register(cors, mergedOptions);
});
