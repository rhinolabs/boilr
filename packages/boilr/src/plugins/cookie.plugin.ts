import cookie, { type FastifyCookieOptions } from "@fastify/cookie";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { mergeConfigRecursively } from "../utils/config.utils.js";

/**
 * Cookie plugin that adds support for parsing and setting cookies.
 * Provides request.cookies for reading cookies and reply.setCookie() for setting them.
 *
 * For configuration options, see: https://www.npmjs.com/package/@fastify/cookie
 */
export const cookiePlugin = fp(async (fastify: FastifyInstance, options: FastifyCookieOptions = {}) => {
  const defaultOptions: FastifyCookieOptions = {
    hook: "onRequest",
  };

  const mergedOptions = mergeConfigRecursively(defaultOptions, options);

  await fastify.register(cookie, mergedOptions);
});