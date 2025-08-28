import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import type { RouteOptions } from "fastify";
import type { FastifyInstance, HttpMethod, RouteHandler, RouteInfo, RouteModule } from "./types.js";

export async function loadRouteModule(filePath: string): Promise<RouteModule | null> {
  try {
    if (!existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return null;
    }

    if (filePath.endsWith(".d.ts")) {
      console.warn(`Skipping TypeScript declaration file: ${filePath}`);
      return null;
    }

    let actualFilePath = filePath;
    if (filePath.endsWith(".ts")) {
      const jsFilePath = filePath.replace(/\.ts$/, ".js");
      if (existsSync(jsFilePath)) {
        actualFilePath = jsFilePath;
        console.log(`Using compiled JS file instead of TS: ${jsFilePath}`);
      }
    }

    try {
      const fileUrl = pathToFileURL(actualFilePath).href;
      const imported = await import(fileUrl);
      return imported as RouteModule;
    } catch (error) {
      console.error(`Error importing ESM module: ${actualFilePath}`, error);

      if (actualFilePath.endsWith(".ts")) {
        const jsFilePath = actualFilePath.replace(/\.ts$/, ".js");
        if (existsSync(jsFilePath) && jsFilePath !== actualFilePath) {
          console.log(`Attempting to load JS version as fallback: ${jsFilePath}`);
          try {
            const fileUrl = pathToFileURL(jsFilePath).href;
            const imported = await import(fileUrl);
            return imported as RouteModule;
          } catch (fallbackError) {
            console.error(`Fallback JS import also failed for: ${jsFilePath}`, fallbackError);
            return null;
          }
        }
      }

      return null;
    }
  } catch (error) {
    console.error(`Unexpected error loading route module: ${filePath}`, error);
    return null;
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

export async function registerRoutes(
  fastify: FastifyInstance,
  routes: RouteInfo[],
  globalHooks: Partial<RouteOptions> = {},
): Promise<void> {
  for (const route of routes) {
    try {
      const module = await loadRouteModule(route.filePath);

      if (!module) {
        fastify.log.warn(`Failed to load route module: ${route.filePath}`);
        continue;
      }

      const methodHandlers = extractMethodHandlers(module, route.filePath);

      for (const [method, handler] of methodHandlers.entries()) {
        const routeOptions: RouteOptions = {
          method: method === "del" ? "DELETE" : method.toUpperCase(),
          url: route.routePath,
          handler,
          ...globalHooks,
        };

        if (module.hooks) {
          Object.assign(routeOptions, module.hooks);
        }

        if (module.schema?.[method === "del" ? "delete" : method]) {
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          const methodSchema = module.schema[method === "del" ? "delete" : method] as any;

          let processedSchema = { ...methodSchema };
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          let authConfig: any;

          if (methodSchema && typeof methodSchema === "object") {
            if ("tags" in methodSchema) {
              const tags = methodSchema.tags;
              if (Array.isArray(tags) && tags.length > 0) {
                const { tags: _, ...schemaWithoutTags } = methodSchema;
                processedSchema = schemaWithoutTags;

                if (!routeOptions.schema) {
                  routeOptions.schema = {};
                }
                routeOptions.schema.tags = tags;
              }
            }

            if ("auth" in methodSchema) {
              authConfig = methodSchema.auth;
              const { auth: _, ...schemaWithoutAuth } = processedSchema;
              processedSchema = schemaWithoutAuth;
            }
          }

          routeOptions.schema = {
            ...routeOptions.schema,
            ...processedSchema,
          };

          if (authConfig !== undefined) {
            if (!routeOptions.schema) {
              routeOptions.schema = {};
            }
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            (routeOptions.schema as any).auth = authConfig;
          }
        }

        fastify.route(routeOptions);
        fastify.log.debug(`Registered route: ${method.toUpperCase()} ${route.routePath} from ${route.filePath}`);
      }
    } catch (error) {
      fastify.log.error({ error, filePath: route.filePath }, `Failed to register route from file: ${route.filePath}`);
    }
  }
}
