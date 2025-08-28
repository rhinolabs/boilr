import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { validateAuthMethods } from "../core/auth/index.js";
import type { AuthConfig } from "../types/auth.types.js";

declare module "fastify" {
  interface FastifyRequest {
    ctx?: any;
  }
}

async function authPluginFunction(fastify: FastifyInstance, options: { authConfig?: AuthConfig }) {
  if (!options.authConfig?.methods) {
    return;
  }

  const { methods } = options.authConfig;

  fastify.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
    const url = request.url;

    // Skip authentication for Swagger/documentation routes
    if (
      url.startsWith("/docs") ||
      url.startsWith("/documentation") ||
      url.includes("/swagger") ||
      url.includes("/openapi")
    ) {
      return;
    }

    const routeOptions = request.routeOptions as any;
    const schema = routeOptions?.schema;
    const method = request.method.toLowerCase();

    let authConfig: string[] | false | undefined;

    if (schema && schema.auth !== undefined) {
      authConfig = schema.auth;
    }

    if (authConfig === false || (Array.isArray(authConfig) && authConfig.length === 0)) {
      return;
    }

    let requiredAuthNames: string[] = [];

    if (Array.isArray(authConfig)) {
      requiredAuthNames = authConfig;
    } else if (authConfig === undefined) {
      requiredAuthNames = methods.map((method) => method.name);
    }

    if (requiredAuthNames.length === 0) {
      return;
    }
    const authContext = await validateAuthMethods(request, methods, requiredAuthNames);
    request.ctx = authContext;
  });
}

export const authPlugin = fp(authPluginFunction, {
  name: "boilr-auth",
});
