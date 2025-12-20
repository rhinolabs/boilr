import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export type BoilrMiddlewareFunction = (request: FastifyRequest, reply: FastifyReply) => Promise<void> | void;

export type BoilrMiddlewareHandler = {
  name: string;
  handler: BoilrMiddlewareFunction;
};

export const middlewares: Record<string, BoilrMiddlewareHandler> = {
  logger: {
    name: "logger",
    handler: async (request, reply) => {
      request.log.info(
        {
          url: request.url,
          method: request.method,
          ip: request.ip,
          userAgent: request.headers["user-agent"],
        },
        "Request received",
      );

      const start = Date.now();
      reply.raw.on("finish", () => {
        const responseTime = Date.now() - start;
        request.log.info(
          {
            url: request.url,
            method: request.method,
            statusCode: reply.statusCode,
            responseTime,
          },
          "Request completed",
        );
      });
    },
  },
  commonHeaders: {
    name: "commonHeaders",
    handler: async (request, reply) => {
      reply.header("X-Request-ID", request.id);
    },
  },
};

export function applyGlobalMiddleware(app: FastifyInstance, middlewareName: string): FastifyInstance {
  const middleware = middlewares[middlewareName];
  if (!middleware) {
    throw new Error(`Middleware "${middlewareName}" not found`);
  }

  app.addHook("onRequest", middleware.handler);
  return app;
}

export function createRouteMiddleware(...middlewareNames: string[]): Record<string, BoilrMiddlewareFunction[]> {
  const handlers = middlewareNames.map((name) => {
    const middleware = middlewares[name];
    if (!middleware) {
      throw new Error(`Middleware "${name}" not found`);
    }
    return middleware.handler;
  });

  return {
    onRequest: handlers,
  };
}

export function registerMiddleware(name: string, handler: BoilrMiddlewareFunction): void {
  middlewares[name] = { name, handler };
}
