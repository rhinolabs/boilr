import type { OpenAPIHono } from "@hono/zod-openapi";
import type { MiddlewareHandler } from "hono";
import type { BoilrEnv } from "../types/env.types.js";
import type { BoilrConfig } from "./config.js";

export interface BoilrInstance {
  app: OpenAPIHono<BoilrEnv>;
  config: BoilrConfig;
  start: (options?: BoilrStartOptions) => Promise<{ app: OpenAPIHono<BoilrEnv>; address: string }>;
  use: (
    pathOrMiddleware: string | MiddlewareHandler<BoilrEnv>,
    middleware?: MiddlewareHandler<BoilrEnv>,
  ) => BoilrInstance;
}

export interface BoilrStartOptions {
  port?: number;
  host?: string;
}

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
