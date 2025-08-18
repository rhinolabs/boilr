import cors, { type FastifyCorsOptions } from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { mergeConfigRecursively } from "../utils/config.utils.js";

/**
 * CORS (Cross-Origin Resource Sharing) plugin that configures cross-origin request
 * handling with sensible defaults for API development.
 *
 * For configuration options, see: https://www.npmjs.com/package/@fastify/cors
 */
export const corsPlugin = fp(async (fastify: FastifyInstance, options: FastifyCorsOptions = {}) => {
  const defaultOptions: FastifyCorsOptions = {
    origin: true,
    methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
    credentials: true,
  };

  const mergedOptions = mergeConfigRecursively(defaultOptions, options);

  await fastify.register(cors, mergedOptions);
});
