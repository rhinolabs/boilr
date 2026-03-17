import type { MiddlewareHandler } from "hono";
import { validateAuthMethods } from "../core/auth/index.js";
import type { BoilrConfig } from "../core/config.js";
import type { BoilrEnv } from "../types/env.types.js";

/**
 * Auth middleware metadata store.
 * Route-loader sets auth config per route path+method.
 */
export const routeAuthConfig = new Map<string, string[] | false | undefined>();

export const getRouteAuthKey = (method: string, path: string): string => `${method.toUpperCase()}:${path}`;

/**
 * Match an actual request path against a route pattern with :param segments.
 * e.g. matchPath("/api/todos/:id", "/api/todos/42") → true
 */
const matchPath = (pattern: string, requestPath: string): boolean => {
  const patternParts = pattern.split("/");
  const pathParts = requestPath.split("/");
  if (patternParts.length !== pathParts.length) return false;
  return patternParts.every((part, i) => part.startsWith(":") || part === pathParts[i]);
};

/**
 * Find the auth config for a given method + actual request path.
 * Global middleware receives routePath "/*", so we must match against
 * the real path and the registered route patterns.
 */
const findRouteAuth = (
  method: string,
  requestPath: string,
): { found: true; value: string[] | false | undefined } | { found: false } => {
  // Exact match (routes without params)
  const exactKey = getRouteAuthKey(method, requestPath);
  if (routeAuthConfig.has(exactKey)) {
    return { found: true, value: routeAuthConfig.get(exactKey) };
  }

  // Pattern matching for parameterised routes like /api/todos/:id
  for (const [key, value] of routeAuthConfig.entries()) {
    const colonIdx = key.indexOf(":");
    const keyMethod = key.substring(0, colonIdx);
    const keyPath = key.substring(colonIdx + 1);

    if (keyMethod !== method) continue;
    if (matchPath(keyPath, requestPath)) return { found: true, value };
  }

  return { found: false };
};

/**
 * Authentication middleware that validates credentials on incoming requests.
 * Supports multiple auth methods (bearer, API key, basic, cookie) and allows
 * per-route auth configuration via route schemas.
 */
export const createAuthMiddleware = (config: BoilrConfig): MiddlewareHandler<BoilrEnv> => {
  const authConfig = config.auth;

  return async (c, next) => {
    if (!authConfig?.methods) {
      await next();
      return;
    }

    const url = c.req.path;

    // Skip authentication for docs routes
    if (
      url.startsWith("/docs") ||
      url.startsWith("/documentation") ||
      url.includes("/swagger") ||
      url.includes("/openapi")
    ) {
      await next();
      return;
    }

    // Look up route-specific auth config using actual request path
    // (c.req.routePath returns "/*" in global middleware, so we can't use it)
    const result = findRouteAuth(c.req.method, c.req.path);
    const routeAuth = result.found ? result.value : undefined;

    if (routeAuth === false || (Array.isArray(routeAuth) && routeAuth.length === 0)) {
      await next();
      return;
    }

    const { methods } = authConfig;
    let requiredAuthNames: string[] = [];

    if (Array.isArray(routeAuth)) {
      requiredAuthNames = routeAuth;
    } else {
      // Default: use all methods with default !== false
      requiredAuthNames = methods.filter((method) => method.default !== false).map((method) => method.name);
    }

    if (requiredAuthNames.length === 0) {
      await next();
      return;
    }

    // Build a BoilrRequest from the request context for the auth extractors
    const boilrRequest = {
      headers: Object.fromEntries([...c.req.raw.headers.entries()].map(([k, v]) => [k, v])),
      query: c.req.query() as Record<string, string>,
      cookies: undefined as Record<string, string> | undefined,
    };

    // Parse cookies from cookie header
    const cookieHeader = c.req.header("cookie");
    if (cookieHeader) {
      boilrRequest.cookies = Object.fromEntries(
        cookieHeader.split(";").map((c) => {
          const [key, ...rest] = c.trim().split("=");
          return [key, rest.join("=")];
        }),
      );
    }

    const ctx = await validateAuthMethods(boilrRequest, methods, requiredAuthNames);
    c.set("ctx", ctx);

    await next();
  };
};
