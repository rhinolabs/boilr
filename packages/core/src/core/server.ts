import type { OpenAPIHono } from "@hono/zod-openapi";
import type { MiddlewareHandler } from "hono";
import type { BoilrEnv } from "../types/env.types.js";
import type { BoilrConfig } from "./config.js";

/**
 * The main BoilrJs application instance.
 * Provides methods to start the server and register middleware.
 */
export interface BoilrInstance {
  app: OpenAPIHono<BoilrEnv>;
  config: BoilrConfig;
  start: (options?: BoilrStartOptions) => Promise<{ app: OpenAPIHono<BoilrEnv>; address: string }>;
  use: (
    pathOrMiddleware: string | MiddlewareHandler<BoilrEnv>,
    middleware?: MiddlewareHandler<BoilrEnv>,
  ) => BoilrInstance;
}

/**
 * Options for starting the BoilrJs server.
 */
export interface BoilrStartOptions {
  port?: number;
  host?: string;
}

/**
 * Creates a BoilrJs server instance that wraps the underlying application
 * with start, use, and configuration capabilities.
 *
 * @param app - The underlying application instance
 * @param config - The merged BoilrJs configuration
 * @param routesReady - Promise that resolves when file routes are registered
 * @returns A configured BoilrInstance ready to be started
 */
export const createServer = (
  app: OpenAPIHono<BoilrEnv>,
  config: BoilrConfig,
  routesReady: Promise<void>,
): BoilrInstance => {
  const boilrApp: BoilrInstance = {
    app,
    config,

    start: async (options: BoilrStartOptions = {}) => {
      // Wait for all file routes to be scanned, loaded, and registered
      await routesReady;

      const port = options.port || config.server?.port || 3000;
      const host = options.host || config.server?.host || "0.0.0.0";

      const { serve } = await import("@hono/node-server");

      return new Promise((resolve) => {
        serve(
          {
            fetch: app.fetch,
            port,
            hostname: host,
          },
          (info) => {
            const address = `http://${host === "0.0.0.0" ? "localhost" : host}:${info.port}`;
            console.log(`Server started on ${address}`);
            resolve({ app, address });
          },
        );
      });
    },

    use: (pathOrMiddleware: string | MiddlewareHandler<BoilrEnv>, middleware?: MiddlewareHandler<BoilrEnv>) => {
      if (typeof pathOrMiddleware === "string" && middleware) {
        app.use(pathOrMiddleware, middleware);
      } else if (typeof pathOrMiddleware === "function") {
        app.use(pathOrMiddleware);
      }
      return boilrApp;
    },
  };

  return boilrApp;
};
