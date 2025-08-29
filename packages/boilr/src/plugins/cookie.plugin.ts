import cookie, { type FastifyCookieOptions } from "@fastify/cookie";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type { BoilrPluginOptions } from "../core/config.js";
import { mergeConfigRecursively } from "../utils/config.utils.js";

/**
 * Cookie plugin that adds support for parsing and setting cookies.
 * Provides request.cookies for reading cookies and reply.setCookie() for setting them.
 *
 * For configuration options, see: https://www.npmjs.com/package/@fastify/cookie
 */
export const cookiePlugin = fp(async (fastify: FastifyInstance, options: BoilrPluginOptions<FastifyCookieOptions>) => {
  const { boilrConfig } = options;

  const defaultOptions: FastifyCookieOptions = {
    hook: "onRequest",
  };
  // If the cookie plugin is explicitly disabled in the boilr config, skip registration
  if (boilrConfig.plugins?.cookie === false) {
    return;
  }

  let cookieConfig = {};
  if (typeof boilrConfig.plugins?.cookie === "object") {
    cookieConfig = boilrConfig.plugins.cookie;
  }

  const mergedOptions = mergeConfigRecursively(defaultOptions, cookieConfig);

  await fastify.register(cookie, mergedOptions);
});
