import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getRouteAuthKey, routeAuthConfig } from "../../plugins/auth.plugin.js";
import { enhanceSchemaWithDefaultError } from "../../schemas/enhancer.js";
import type { AuthConfig } from "../../types/auth.types.js";
import type { ExceptionConfig } from "../../types/error.types.js";
import type { BoilrEnv } from "../../types/fastify.types.js";
import type { HttpMethod, RouteHandler, RouteInfo, RouteModule } from "../../types/file-routes.types.js";
import type { MethodSchema, TypedReply } from "../../types/routes.types.js";
import { generateSecurityRequirement } from "../../utils/swagger.utils.js";

export async function loadRouteModule(filePath: string): Promise<RouteModule | undefined> {
  try {
    if (!existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return;
    }

    if (filePath.endsWith(".d.ts")) {
      return;
    }

    let actualFilePath = filePath;
    if (filePath.endsWith(".ts")) {
      const jsFilePath = filePath.replace(/\.ts$/, ".js");
      if (existsSync(jsFilePath)) {
        actualFilePath = jsFilePath;
      }
    }

    try {
      const fileUrl = pathToFileURL(actualFilePath).href;
      const imported = await import(fileUrl);
      return imported as RouteModule;
    } catch (error) {
      console.error(`Error importing module: ${actualFilePath}`, error);

      if (actualFilePath.endsWith(".ts")) {
        const jsFilePath = actualFilePath.replace(/\.ts$/, ".js");
        if (existsSync(jsFilePath) && jsFilePath !== actualFilePath) {
          try {
            const fileUrl = pathToFileURL(jsFilePath).href;
            const imported = await import(fileUrl);
            return imported as RouteModule;
          } catch {
            return;
          }
        }
      }

      return;
    }
  } catch (error) {
    console.error(`Unexpected error loading route module: ${filePath}`, error);
    return;
  }
}

export function extractMethodHandlers(module: RouteModule, filePath: string): Map<HttpMethod, RouteHandler> {
  const methods = new Map<HttpMethod, RouteHandler>();
  const httpMethods: HttpMethod[] = ["get", "post", "put", "del", "patch", "head", "options"];

  for (const method of httpMethods) {
    const handler = module[method];
    if (typeof handler === "function") {
      methods.set(method, handler);
    }
  }

  if (methods.size === 0 && module.default) {
    if (typeof module.default === "function") {
      methods.set("get", module.default);
    } else if (typeof module.default === "object") {
      const defaultObj = module.default as Record<string, RouteHandler>;
      for (const method of httpMethods) {
        const handler = defaultObj[method];
        if (typeof handler === "function") {
          methods.set(method as HttpMethod, handler);
        }
      }
    }
  }

  if (methods.size === 0) {
    console.warn(`No valid HTTP method handlers found in route file: ${filePath}`);
  }

  return methods;
}

/**
 * Creates the adapter for OpenAPI-registered routes.
 * Uses c.req.valid() to get Zod-validated/transformed data.
 */
function createOpenAPIHandlerAdapter(userHandler: RouteHandler, methodSchema: Record<string, unknown>) {
  const hasParams = !!methodSchema.params;
  const hasQuery = !!methodSchema.querystring;
  const hasBody = !!methodSchema.body;
  const hasHeaders = !!methodSchema.headers;

  return async (c: Context<BoilrEnv>): Promise<Response> => {
    const request: Record<string, unknown> = {
      params: hasParams ? c.req.valid("param" as never) : c.req.param(),
      query: hasQuery ? c.req.valid("query" as never) : c.req.query(),
      headers: hasHeaders ? c.req.valid("header" as never) : Object.fromEntries([...c.req.raw.headers.entries()]),
      env: c.env,
      raw: c.req.raw,
      ctx: c.get("ctx"),
    };

    if (hasBody) {
      request.body = c.req.valid("json" as never);
    } else if (["POST", "PUT", "PATCH"].includes(c.req.method)) {
      try {
        request.body = await c.req.json();
      } catch {
        request.body = undefined;
      }
    }

    return invokeHandler(userHandler, request, c);
  };
}

/**
 * Creates the adapter for plain (non-OpenAPI) routes.
 * No Zod validation available — reads raw data.
 */
function createPlainHandlerAdapter(userHandler: RouteHandler) {
  return async (c: Context<BoilrEnv>): Promise<Response> => {
    const request: Record<string, unknown> = {
      params: c.req.param(),
      query: c.req.query(),
      headers: Object.fromEntries([...c.req.raw.headers.entries()]),
      env: c.env,
      raw: c.req.raw,
      ctx: c.get("ctx"),
    };

    if (["POST", "PUT", "PATCH"].includes(c.req.method)) {
      try {
        request.body = await c.req.json();
      } catch {
        request.body = undefined;
      }
    }

    return invokeHandler(userHandler, request, c);
  };
}

/**
 * Shared handler invocation: builds reply, calls user handler, wraps result.
 */
async function invokeHandler(
  userHandler: RouteHandler,
  request: Record<string, unknown>,
  c: Context<BoilrEnv>,
): Promise<Response> {
  let statusCode = 200;
  const reply: TypedReply = {
    code: (s: number) => {
      statusCode = s;
      return reply;
    },
    header: (name: string, value: string) => {
      c.header(name, value);
      return reply;
    },
    send: (data: unknown) => {
      return c.json(data, statusCode as 200);
    },
  };

  const result = await userHandler(request, reply);

  if (result instanceof Response) {
    return result;
  }

  if (result !== undefined && result !== null) {
    return c.json(result, statusCode as 200);
  }

  return c.json(null, statusCode as 200);
}

function toHonoMethod(method: HttpMethod): string {
  return method === "del" ? "delete" : method;
}

export async function registerRoutes(
  app: OpenAPIHono<BoilrEnv>,
  routes: RouteInfo[],
  exceptionsConfig?: ExceptionConfig,
  authConfig?: AuthConfig,
): Promise<void> {
  for (const route of routes) {
    try {
      const module = await loadRouteModule(route.filePath);

      if (!module) {
        console.warn(`Failed to load route module: ${route.filePath}`);
        continue;
      }

      const methodHandlers = extractMethodHandlers(module, route.filePath);

      for (const [method, handler] of methodHandlers.entries()) {
        const honoMethod = toHonoMethod(method);
        const schemaKey = method === "del" ? "delete" : method;

        // Get method-specific schema
        let methodSchema = module.schema?.[schemaKey] as Record<string, unknown> | undefined;

        // Enhance schema with default error responses
        if (methodSchema) {
          methodSchema = enhanceSchemaWithDefaultError(methodSchema as MethodSchema, exceptionsConfig) as Record<
            string,
            unknown
          >;
        }

        // Store auth config for this route
        if (methodSchema) {
          const authKey = getRouteAuthKey(honoMethod.toUpperCase(), route.routePath);
          routeAuthConfig.set(authKey, methodSchema.auth as string[] | false | undefined);
        }

        // Build OpenAPI route definition if we have schema
        if (methodSchema && hasOpenAPISchema(methodSchema)) {
          try {
            const openApiRoute = buildOpenAPIRoute(
              honoMethod,
              route.routePath,
              methodSchema,
              module.schema,
              authConfig,
            );
            app.openapi(openApiRoute, createOpenAPIHandlerAdapter(handler, methodSchema));
          } catch (err) {
            // Fallback to plain route if OpenAPI registration fails
            console.warn(
              `OpenAPI registration failed for ${honoMethod.toUpperCase()} ${route.routePath}, using plain route:`,
              err,
            );
            registerPlainRoute(app, honoMethod, route.routePath, handler);
          }
        } else {
          registerPlainRoute(app, honoMethod, route.routePath, handler);
        }
      }
    } catch (error) {
      console.error(`Failed to register route from file: ${route.filePath}`, error);
    }
  }
}

function hasOpenAPISchema(schema: Record<string, unknown>): boolean {
  return !!(schema.params || schema.querystring || schema.body || schema.response);
}

function registerPlainRoute(app: OpenAPIHono<BoilrEnv>, method: string, path: string, handler: RouteHandler): void {
  const adapter = createPlainHandlerAdapter(handler);
  // biome-ignore lint/suspicious/noExplicitAny: dynamic method routing
  (app as any)[method](path, adapter);
}

/**
 * Bridges BoilrJS defineSchema() to @hono/zod-openapi createRoute().
 */
function buildOpenAPIRoute(
  method: string,
  path: string,
  methodSchema: Record<string, unknown>,
  // biome-ignore lint/suspicious/noExplicitAny: dynamic schema access
  fullSchema?: any,
  authConfig?: AuthConfig,
) {
  // Convert path from :param to {param} for OpenAPI
  const openApiPath = path.replace(/:(\w+)/g, "{$1}").replace(/\*/g, "{_splat}");

  // biome-ignore lint/suspicious/noExplicitAny: dynamic route building
  const routeDef: Record<string, any> = {
    method: method as "get" | "post" | "put" | "delete" | "patch" | "head" | "options",
    path: openApiPath,
    request: {},
    responses: {},
  };

  // Add tags
  if (methodSchema.tags) {
    routeDef.tags = methodSchema.tags;
  }

  // Add security requirements based on auth config
  if (authConfig?.methods) {
    const routeAuth = methodSchema.auth;

    if (routeAuth === false || (Array.isArray(routeAuth) && routeAuth.length === 0)) {
      // Public route — explicitly no security
      routeDef.security = [];
    } else if (Array.isArray(routeAuth)) {
      // Specific auth methods required
      routeDef.security = [generateSecurityRequirement(routeAuth as string[])];
    } else {
      // Default: use all auth methods with default !== false
      const defaultMethodNames = authConfig.methods.filter((m) => m.default !== false).map((m) => m.name);
      if (defaultMethodNames.length > 0) {
        routeDef.security = [generateSecurityRequirement(defaultMethodNames)];
      }
    }
  }

  // Add params schema (merge common + method-specific)
  const paramsSchema = methodSchema.params || fullSchema?.params;
  if (paramsSchema) {
    routeDef.request.params = paramsSchema;
  }

  // Add query schema
  const querySchema = methodSchema.querystring || fullSchema?.querystring;
  if (querySchema) {
    routeDef.request.query = querySchema;
  }

  // Add headers schema
  const headersSchema = methodSchema.headers || fullSchema?.headers;
  if (headersSchema) {
    routeDef.request.headers = headersSchema;
  }

  // Add body schema
  if (methodSchema.body) {
    routeDef.request.body = {
      content: {
        "application/json": {
          schema: methodSchema.body,
        },
      },
    };
  }

  // Add response schemas
  const responseSchemas = methodSchema.response as Record<number, unknown> | undefined;
  if (responseSchemas) {
    for (const [statusCode, schema] of Object.entries(responseSchemas)) {
      routeDef.responses[statusCode] = {
        description: `Response ${statusCode}`,
        content: {
          "application/json": {
            schema,
          },
        },
      };
    }
  }

  // Ensure at least one response exists
  if (Object.keys(routeDef.responses).length === 0) {
    routeDef.responses["200"] = {
      description: "Success",
    };
  }

  // biome-ignore lint/suspicious/noExplicitAny: dynamic route config construction
  return createRoute(routeDef as any);
}
