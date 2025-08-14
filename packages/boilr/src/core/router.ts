import path from "node:path";
import { fastifyFileRoutes } from "@rhinolabs/fastify-file-routes";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";

interface ExtendedPluginOptions extends FastifyPluginOptions {
  routesDir?: string;
  prefix?: string;
  options?: {
    ignore?: RegExp[];
    extensions?: string[];
  };
}

/**
 * The Next.js style router plugin that uses @rhinolabs/fastify-file-routes
 */
export const routerPlugin = fp<ExtendedPluginOptions>(
  async (fastify: FastifyInstance, options: ExtendedPluginOptions) => {
    await fastify.register(fastifyFileRoutes, {
      routesDir: path.isAbsolute(options.routesDir || "")
        ? options.routesDir || ""
        : path.join(process.cwd(), options.routesDir || "./routes"),
      prefix: options.prefix || "",
      options: {
        ignore: options.options?.ignore,
        extensions: options.options?.extensions,
      },
    });
  },
);
