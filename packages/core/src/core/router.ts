import path from "path";
import autoload, { type AutoloadPluginOptions } from "@fastify/autoload";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";

interface ExtendedPluginOptions extends FastifyPluginOptions {
  routesDir?: string;
  prefix?: string;
}

export const routerPlugin = fp<ExtendedPluginOptions>(
  async (fastify: FastifyInstance, options: ExtendedPluginOptions) => {
    const routeOptions: AutoloadPluginOptions = {
      dir: path.isAbsolute(options.routesDir || "")
        ? (options.routesDir as string)
        : path.join(process.cwd(), options.routesDir || "./routes"),
      options: {
        prefix: options.prefix || "",
      },
      autoHooks: true,
      cascadeHooks: true,
      routeParams: true,
      ignorePattern: /spec|test|__test__|node_modules/,
      dirNameRoutePrefix: true,
    };

    // Custom path transformation if needed
    if (typeof getRoutePath === "function") {
      // @ts-ignore - Ignoring this as the type definition doesn't include this property
      routeOptions.pathToRoute = getRoutePath;
    }

    fastify.register(autoload, routeOptions);
  },
);

function getRoutePath(path: string): string {
  if (path.endsWith("/index")) {
    return path.slice(0, -6) || "/";
  }

  return path.replace(/\[([^\]]+)\]/g, ":$1");
}
