import path from "node:path";
import { fastifyFileRoutes } from "@rhinolabs/fastify-file-routes";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type { BoilrRoutesConfig } from "./config.js";

/**
 * The Next.js style router plugin that uses @rhinolabs/fastify-file-routes
 */
export const routerPlugin = fp<BoilrRoutesConfig>(async (fastify: FastifyInstance, options: BoilrRoutesConfig) => {
  await fastify.register(fastifyFileRoutes, {
    routesDir: path.isAbsolute(options?.dir || "")
      ? options?.dir || ""
      : path.join(process.cwd(), options?.dir || "./routes"),
    prefix: options?.prefix || "",
    options: {
      ignore: options?.options?.ignore,
      extensions: options?.options?.extensions,
    },
  });
});
