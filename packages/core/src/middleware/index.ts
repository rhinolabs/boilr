import type { OpenAPIHono } from "@hono/zod-openapi";
import type { MiddlewareHandler } from "hono";
import type { BoilrEnv } from "../types/env.types.js";

export type BoilrMiddlewareFunction = MiddlewareHandler<BoilrEnv>;

export type BoilrMiddlewareHandler = {
  name: string;
  handler: BoilrMiddlewareFunction;
};

export const middlewares: Record<string, BoilrMiddlewareHandler> = {
  logger: {
    name: "logger",
    handler: async (c, next) => {
      const start = Date.now();
      console.log(
        JSON.stringify({
          url: c.req.url,
          method: c.req.method,
          ip: c.req.header("x-forwarded-for") || c.req.header("cf-connecting-ip") || "unknown",
          userAgent: c.req.header("user-agent"),
          message: "Request received",
        }),
      );

      await next();

      const responseTime = Date.now() - start;
      console.log(
        JSON.stringify({
          url: c.req.url,
          method: c.req.method,
          statusCode: c.res.status,
          responseTime,
          message: "Request completed",
        }),
      );
    },
  },
  commonHeaders: {
    name: "commonHeaders",
    handler: async (c, next) => {
      c.header("X-Request-ID", c.get("requestId") || crypto.randomUUID());
      await next();
    },
  },
};

export const applyGlobalMiddleware = (app: OpenAPIHono<BoilrEnv>, middlewareName: string): void => {
  const middleware = middlewares[middlewareName];
  if (!middleware) {
    throw new Error(`Middleware "${middlewareName}" not found`);
  }

  app.use(middleware.handler);
};

export const createRouteMiddleware = (...middlewareNames: string[]): BoilrMiddlewareFunction[] => {
  return middlewareNames.map((name) => {
    const middleware = middlewares[name];
    if (!middleware) {
      throw new Error(`Middleware "${name}" not found`);
    }
    return middleware.handler;
  });
};

export const registerMiddleware = (name: string, handler: BoilrMiddlewareFunction): void => {
  middlewares[name] = { name, handler };
};
