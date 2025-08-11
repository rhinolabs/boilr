import type {
  FastifyInstance as BaseFastifyInstance,
  FastifyPluginAsync as BasePluginAsync,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
  FastifyTypeProviderDefault,
  RawServerDefault,
  RouteOptions,
} from "fastify";

/**
 * Configuration options for the fastify-file-routes plugin
 */
export interface FileRoutesOptions extends FastifyPluginOptions {
  /**
   * Directory containing route files
   * Can be absolute or relative to process.cwd()
   */
  routesDir: string;

  /**
   * Optional prefix for all routes
   * @example '/api' will prefix all routes with '/api'
   */
  prefix?: string;

  /**
   * Additional options for route scanning and registration
   */
  options?: {
    /**
     * Patterns of files to ignore
     * @default [/node_modules/, /\.(test|spec)\./]
     */
    ignore?: RegExp[];

    /**
     * Custom path transformation function
     * @param path - The file path
     * @param filename - The filename
     * @returns The transformed route path
     */
    pathTransform?: (path: string, filename: string) => string;

    /**
     * Global hooks to apply to all routes
     */
    globalHooks?: Partial<RouteOptions>;

    /**
     * Extension whitelist (file extensions to include)
     * @default ['.js', '.cjs', '.mjs', '.ts']
     */
    extensions?: string[];
  };
}

/**
 * HTTP methods supported in route files
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

/**
 * Route handler function
 */
export type RouteHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<unknown> | unknown;

/**
 * Schema definition for a route
 */
export interface RouteSchema {
  [method: string]: {
    params?: unknown;
    querystring?: unknown;
    body?: unknown;
    response?: {
      [code: number]: unknown;
    };
  };
}

/**
 * Route module structure - what each route file should export
 */
export interface RouteModule {
  // Schema definition (optional)
  schema?: RouteSchema;

  // Hook definitions (optional)
  hooks?: Partial<RouteOptions>;

  // Handler for each HTTP method (optional)
  GET?: RouteHandler;
  POST?: RouteHandler;
  PUT?: RouteHandler;
  DELETE?: RouteHandler;
  PATCH?: RouteHandler;
  HEAD?: RouteHandler;
  OPTIONS?: RouteHandler;

  // Default export (fallback)
  default?: RouteHandler | Record<HttpMethod, RouteHandler>;
}

/**
 * Route info after scanning
 */
export interface RouteInfo {
  /**
   * File path of the route module
   */
  filePath: string;

  /**
   * URL path for the route
   */
  routePath: string;

  /**
   * Original filename
   */
  filename: string;
}

/**
 * Alias for FastifyInstance to avoid direct references to the fastify module
 */
export type FastifyInstance = BaseFastifyInstance;

/**
 * Alias for FastifyPluginAsync to avoid direct references to the fastify module
 */
export type FastifyPluginAsync<Options extends FastifyPluginOptions = FastifyPluginOptions> = BasePluginAsync<
  Options,
  RawServerDefault,
  FastifyTypeProviderDefault
>;
