import path from "node:path";
import { fastifyFileRoutes } from "@rhinolabs/fastify-file-routes";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type { BoilrConfig } from "./config.js";

/**
 * The Next.js style router plugin that uses @rhinolabs/fastify-file-routes
 */
export const routerPlugin = fp<BoilrConfig>(async (fastify: FastifyInstance, config: BoilrConfig) => {
  // Store boilr config on fastify instance for access in schema transforms
  if (!fastify.hasDecorator("boilrConfig")) {
    fastify.decorate("boilrConfig", config);
  }

  await fastify.register(fastifyFileRoutes, {
    routesDir: path.isAbsolute(config.routes?.dir || "")
      ? config.routes?.dir || ""
      : path.join(process.cwd(), config.routes?.dir || "./routes"),
    prefix: config.routes?.prefix || "",
    options: {
      ignore: config.routes?.options?.ignore,
      extensions: config.routes?.options?.extensions,
    },
  });
});
