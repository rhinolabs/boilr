import path from "node:path";
import type { OpenAPIHono } from "@hono/zod-openapi";
import type { BoilrEnv } from "../types/env.types.js";
import type { BoilrConfig } from "./config.js";
import { loadFileRoutes } from "./file-routes/index.js";

/**
 * Starts file-route registration and returns the promise.
 * Callers must await this before the server is ready to serve.
 */
export const registerFileRoutes = (app: OpenAPIHono<BoilrEnv>, config: BoilrConfig): Promise<void> => {
  const routesDir = path.isAbsolute(config.routes?.dir || "")
    ? config.routes?.dir || ""
    : path.join(process.cwd(), config.routes?.dir || "./routes");

  return loadFileRoutes(app, {
    routesDir,
    prefix: config.routes?.prefix || "",
    exceptionsConfig: config.exceptions,
    authConfig: config.auth,
    options: {
      ignore: config.routes?.options?.ignore,
      extensions: config.routes?.options?.extensions,
    },
  });
};
