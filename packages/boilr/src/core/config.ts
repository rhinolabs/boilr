import type { FastifyCorsOptions } from "@fastify/cors";
import type { FastifyHelmetOptions } from "@fastify/helmet";
import type { CreateRateLimitOptions } from "@fastify/rate-limit";
import type { FastifyDynamicSwaggerOptions } from "@fastify/swagger";
import type { PerformanceMonitorOptions } from "@rhinolabs/fastify-monitor";
import type { FastifyServerOptions } from "fastify";
import type { ZodType } from "zod";
import type { ExceptionConfig } from "../types/error.types.js";
import { mergeConfigRecursively } from "../utils/config.utils.js";

export interface BoilrServerConfig {
  /**
   * Port on which the server will listen.
   * @default 3000
   */
  port?: number;
  /**
   * Hostname for the server.
   */
  host?: string;
  /**
   * Logging configuration.
   */
  logger?: boolean | object;
}

export interface BoilrRoutesConfig {
  /**
   * Directory to scan for route files.
   */
  dir?: string;
  /**
   * Prefix to add to all routes.
   */
  prefix?: string;
  /**
   * Options for the Next.js style router
   */
  options?: {
    /**
     * Patterns of files to ignore
     */
    ignore?: RegExp[];
    /**
     * File extensions to include
     */
    extensions?: string[];
  };
}

export interface BoilrPluginsConfig {
  /**
   * Helmet plugin configuration for security headers.
   * Set to `false` to disable, `true` for defaults, or an object for custom config.
   * @default true
   *
   * For available options, see: https://www.npmjs.com/package/@fastify/helmet
   *
   * @example
   * ```typescript
   * helmet: {
   *   contentSecurityPolicy: false,
   *   crossOriginEmbedderPolicy: false
   * }
   * ```
   */
  helmet?: boolean | FastifyHelmetOptions;

  /**
   * Rate limiting plugin configuration.
   * Set to `false` to disable, `true` for defaults, or an object for custom config.
   * @default true
   *
   * For available options, see: https://www.npmjs.com/package/@fastify/rate-limit
   *
   * @example
   * ```typescript
   * rateLimit: {
   *   max: 100,
   *   timeWindow: '1 minute'
   * }
   * ```
   */
  rateLimit?: boolean | CreateRateLimitOptions;

  /**
   * CORS (Cross-Origin Resource Sharing) plugin configuration.
   * Set to `false` to disable, `true` for defaults, or an object for custom config.
   * @default true
   *
   * For available options, see: https://www.npmjs.com/package/@fastify/cors
   *
   * @example
   * ```typescript
   * cors: {
   *   origin: ["http://localhost:3000", "https://myapp.com"],
   *   credentials: true
   * }
   * ```
   */
  cors?: boolean | FastifyCorsOptions;

  /**
   * Swagger documentation plugin configuration.
   * Set to `false` to disable, `true` for defaults, or an object for custom config.
   * @default true
   *
   * For available options, see: https://www.npmjs.com/package/@fastify/swagger
   *
   * @example
   * ```typescript
   * swagger: {
   *   info: {
   *     title: "My API",
   *     description: "API documentation",
   *     version: "1.0.0"
   *   },
   *   servers: [
   *     { url: "http://localhost:3000", description: "Development" }
   *   ]
   * }
   * ```
   */
  swagger?: boolean | FastifyDynamicSwaggerOptions;

  /**
   * Development performance monitoring plugin configuration.
   * Only active in development mode (NODE_ENV=development).
   * Set to `false` to disable, `true` for defaults, or an object for custom config.
   * @default true
   *
   * For available options, see: https://www.npmjs.com/package/@rhinolabs/fastify-monitor
   */
  monitor?: boolean | PerformanceMonitorOptions;
}

/**
 * Middleware configuration for Boilr applications.
 *
 * @example
 * ```typescript
 * const middlewareConfig: BoilrMiddlewareConfig = {
 *   global: ["logger", "auth", "cors"]
 * };
 * ```
 */
export interface BoilrMiddlewareConfig {
  /**
   * Array of global middleware names to apply to all routes.
   * Middleware are applied in the order specified.
   * @default ["logger", "commonHeaders"]
   *
   * @example
   * ```typescript
   * global: ["logger", "auth", "validation"]
   * ```
   */
  global?: string[];
}

/**
 * Main configuration interface for Boilr applications.
 * This interface defines all available configuration options for customizing your Boilr app.
 *
 * @example
 * ```typescript
 * const config: BoilrConfig = {
 *   server: {
 *     port: 3000,
 *     host: "localhost"
 *   },
 *   routes: {
 *     dir: "./src/routes",
 *     prefix: "/api"
 *   },
 *   plugins: {
 *     swagger: {
 *       info: {
 *         title: "My API",
 *         version: "1.0.0"
 *       }
 *     }
 *   },
 *   exceptions: {
 *     formatter: (error, statusCode, request) => ({
 *       success: false,
 *       message: error.message,
 *       code: statusCode
 *     })
 *    };
 * ```
 */
export interface BoilrConfig<TSchema extends ZodType = ZodType<unknown>> {
  /**
   * Server configuration options.
   */
  server?: BoilrServerConfig;

  /**
   * Routes discovery and registration configuration.
   */
  routes?: BoilrRoutesConfig;

  /**
   * Plugin configuration options.
   */
  plugins?: BoilrPluginsConfig;

  /**
   * Middleware configuration options.
   */
  middleware?: BoilrMiddlewareConfig;

  /**
   * Enable or disable request/response validation using Zod schemas.
   * @default true
   */
  validation?: boolean;

  /**
   * Exception handling configuration for HTTP errors and validation.
   * Configure custom error formatters, logging, and validation behavior.
   */
  exceptions?: ExceptionConfig<TSchema>;

  /**
   * Raw Fastify server options.
   * These options are passed directly to the underlying Fastify instance.
   *
   * @see https://fastify.dev/docs/latest/Reference/Server/
   */
  fastify?: FastifyServerOptions;
}

/**
 * Default configuration values for Boilr applications.
 * These defaults provide a good starting point for most applications.
 */
export const defaultConfig: BoilrConfig = {
  server: {
    port: 3000,
    host: "0.0.0.0",
    logger: true,
  },
  routes: {
    dir: "./routes",
    prefix: "",
  },
  plugins: {
    helmet: true,
    rateLimit: true,
    cors: true,
    swagger: true,
    monitor: true,
  },
  middleware: {
    global: ["logger", "commonHeaders"],
  },
  validation: true,
  exceptions: {
    logErrors: true,
    defaultErrorStatusCodes: [500],
  },
};

/**
 * Merges user configuration with default configuration values.
 * This function performs a deep merge, allowing users to override specific
 * configuration properties while keeping defaults for unspecified options.
 *
 * @param userConfig - User-provided configuration options
 * @returns Merged configuration with defaults applied
 *
 * @example
 * ```typescript
 * const config = mergeConfig({
 *   server: { port: 8080 }, // Only override port
 *   plugins: { cors: false } // Disable CORS
 * });
 * // Result: All defaults + port: 8080 + cors: false
 * ```
 */
export function mergeConfig(userConfig: BoilrConfig = {}): BoilrConfig {
  return mergeConfigRecursively(defaultConfig, userConfig);
}
