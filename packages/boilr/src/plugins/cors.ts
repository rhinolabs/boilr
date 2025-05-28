import cors from "@fastify/cors";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";

/**
 * CORS (Cross-Origin Resource Sharing) plugin that configures cross-origin request
 * handling with sensible defaults for API development.
 */
export const corsPlugin = fp(async (fastify: FastifyInstance, options: FastifyPluginOptions = {}) => {
  const defaultOptions = {
    origin: true,
    methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
    credentials: true,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  await fastify.register(cors, mergedOptions);
});
