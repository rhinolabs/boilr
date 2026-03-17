import path from "node:path";
import type { OpenAPIHono } from "@hono/zod-openapi";
import type { ExceptionConfig } from "../types/error.types.js";
import type { BoilrEnv } from "../types/fastify.types.js";
import type { BoilrConfig } from "./config.js";
import { honoFileRoutes } from "./file-routes/index.js";

/**
 * Starts file-route registration and returns the promise.
 * Callers must await this before the server is ready to serve.
 */
export function registerFileRoutes(app: OpenAPIHono<BoilrEnv>, config: BoilrConfig): Promise<void> {
  const routesDir = path.isAbsolute(config.routes?.dir || "")
    ? config.routes?.dir || ""
    : path.join(process.cwd(), config.routes?.dir || "./routes");

  return honoFileRoutes(app, {
    routesDir,
    prefix: config.routes?.prefix || "",
    exceptionsConfig: config.exceptions,
    options: {
      ignore: config.routes?.options?.ignore,
      extensions: config.routes?.options?.extensions,
    },
  });
}
