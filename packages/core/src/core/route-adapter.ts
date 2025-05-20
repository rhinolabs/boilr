import type { FastifyInstance, FastifyRequest, FastifyReply, RouteOptions } from "fastify";
import path from "node:path";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete" | "options" | "head";

type RouteHandler = (req: FastifyRequest, reply: FastifyReply) => Promise<any> | any;

interface RouteHandlers {
  [key: string]: RouteHandler;
}

interface RouteModule {
  default?: RouteHandler | RouteHandlers;
  schema?: Record<string, any>;
  middleware?: string[];
  [key: string]: any;
}

/**
 * Registers file-based routes from a specified directory to a Fastify instance
 * using a Next.js-like routing approach with file-system-based routes.
 */
export async function registerFileRoutes(
  fastify: FastifyInstance,
  routesDir: string,
  prefix = ""
): Promise<void> {
  const absoluteRoutesDir = path.isAbsolute(routesDir)
    ? routesDir
    : path.join(process.cwd(), routesDir);
  
  // Verify that the routes directory exists
  try {
    await fs.access(absoluteRoutesDir);
  } catch (err) {
    fastify.log.warn(`Routes directory "${absoluteRoutesDir}" does not exist or is not accessible`);
    return;
  }

  await scanDirectoryAndRegisterRoutes(fastify, absoluteRoutesDir, prefix);
}

async function scanDirectoryAndRegisterRoutes(
  fastify: FastifyInstance,
  dirPath: string,
  routePrefix: string,
  relativePath = ""
): Promise<void> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // For directories, recurse with updated relative path
      const newRelativePath = path.join(relativePath, entry.name);
      await scanDirectoryAndRegisterRoutes(fastify, fullPath, routePrefix, newRelativePath);
    } else if (isRouteFile(entry.name)) {
      // For files, register routes
      await registerRouteFromFile(fastify, fullPath, routePrefix, relativePath, entry.name);
    }
  }
}

function isRouteFile(filename: string): boolean {
  // Skip test, spec files and non-JS/TS files
  if (/\.(test|spec)\.(js|ts|mjs|cjs)$/.test(filename) || 
      !(/\.(js|ts|mjs|cjs)$/.test(filename))) {
    return false;
  }
  
  return true;
}

async function registerRouteFromFile(
  fastify: FastifyInstance,
  filePath: string,
  routePrefix: string,
  relativePath: string,
  fileName: string
): Promise<void> {
  try {
    // Load the route module
    const routeModule = await importRouteModule(filePath);
    if (!routeModule) return;

    // Build the route URL path
    const routePath = buildRoutePath(routePrefix, relativePath, fileName);
    
    // Get methods and handlers from the module
    const methodHandlers = extractMethodHandlers(routeModule);
    
    // Register each method
    for (const [method, handler] of Object.entries(methodHandlers)) {
      const routeOptions: RouteOptions = {
        method: method.toUpperCase() as any,
        url: routePath,
        handler: wrapHandler(handler),
      };

      // Add schema if present for this method
      const methodSchema = routeModule.schema?.[method];
      if (methodSchema) {
        routeOptions.schema = methodSchema;
      }

      // Register the route
      fastify.route(routeOptions);
      fastify.log.debug(`Registered route: ${method.toUpperCase()} ${routePath}`);
    }
  } catch (err) {
    fastify.log.error(`Failed to register route from file: ${filePath}`, err);
  }
}

async function importRouteModule(filePath: string): Promise<RouteModule | null> {
  try {
    // Use dynamic import with file URL to load ESM or CommonJS modules
    const fileUrl = pathToFileURL(filePath).href;
    const imported = await import(fileUrl);
    return imported;
  } catch (err) {
    console.error(`Error importing route module from ${filePath}:`, err);
    return null;
  }
}

function buildRoutePath(routePrefix: string, relativePath: string, fileName: string): string {
  // Remove extension
  let routeName = fileName.replace(/\.(js|ts|mjs|cjs)$/, "");
  
  // Handle method suffix: [get], [post], etc.
  routeName = routeName.replace(/\.\[(get|post|put|patch|delete|options|head)\]$/, "");
  
  // Handle index files
  if (routeName === "index") {
    routeName = "";
  }
  
  // Replace dynamic route parameters: [id] -> :id
  routeName = routeName.replace(/\[([^\]]+)\]/g, ":$1");
  
  // Combine all parts and normalize
  const routeParts = [routePrefix, relativePath, routeName]
    .filter(Boolean)
    .join("/")
    .replace(/\/+/g, "/"); // Replace multiple slashes with a single one
  
  return routeParts || "/";
}

function extractMethodHandlers(routeModule: RouteModule): Record<string, RouteHandler> {
  const handlers: Record<string, RouteHandler> = {};
  
  // Handle default export as function (applies to all methods or determined by filename)
  if (typeof routeModule.default === "function") {
    const methodFromFilename = getMethodFromFilename(routeModule.__filename);
    if (methodFromFilename) {
      handlers[methodFromFilename] = routeModule.default;
    } else {
      // If no method specified in filename, use for all HTTP methods
      const httpMethods: HttpMethod[] = ["get", "post", "put", "patch", "delete", "options", "head"];
      for (const method of httpMethods) {
        handlers[method] = routeModule.default;
      }
    }
  } 
  // Handle default export as object with method handlers
  else if (routeModule.default && typeof routeModule.default === "object") {
    for (const [key, value] of Object.entries(routeModule.default)) {
      if (isHttpMethod(key) && typeof value === "function") {
        handlers[key] = value as RouteHandler;
      }
    }
  }
  
  // Check for named exports matching HTTP methods
  for (const method of ["get", "post", "put", "patch", "delete", "options", "head"] as const) {
    if (typeof routeModule[method] === "function") {
      handlers[method] = routeModule[method];
    }
  }
  
  return handlers;
}

function getMethodFromFilename(filename?: string): HttpMethod | null {
  if (!filename) return null;
  
  const match = filename.match(/\.\[(get|post|put|patch|delete|options|head)\]\.(js|ts|mjs|cjs)$/);
  return match ? match[1] as HttpMethod : null;
}

function isHttpMethod(method: string): method is HttpMethod {
  return ["get", "post", "put", "patch", "delete", "options", "head"].includes(method);
}

function wrapHandler(handler: RouteHandler): RouteHandler {
  return async function(req: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await handler(req, reply);
      // If the handler didn't call reply.send(), we'll return the result
      if (!reply.sent) {
        return result;
      }
    } catch (err) {
      throw err;
    }
  };
}