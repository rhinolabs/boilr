import type { AuthConfig } from "../types/auth.types.js";
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
   * @default "0.0.0.0"
   */
  host?: string;
  /**
   * Logging configuration.
   * Set to `true` for default structured logging, `false` to disable,
   * or pass an object for custom logger options.
   * @default true
   */
  logger?: boolean | object;
}

export interface BoilrRoutesConfig {
  /**
   * Directory to scan for route files. Supports absolute paths
   * or relative paths (resolved from `process.cwd()`).
   * @default "./routes"
   */
  dir?: string;
  /**
   * Prefix to add to all routes.
   *
   * @example
   * ```typescript
   * prefix: "/api/v1"
   * // routes/users.ts -> /api/v1/users
   * ```
   */
  prefix?: string;
  /**
   * Options for the Next.js style file-based router.
   */
  options?: {
    /**
     * Patterns of files to ignore during route scanning.
     *
     * @example
     * ```typescript
     * ignore: [/\.test\./, /\_helpers/]
     * ```
     */
    ignore?: RegExp[];
    /**
     * File extensions to include during route scanning.
     * @default [".js", ".cjs", ".mjs", ".ts"]
     */
    extensions?: string[];
  };
}

/**
 * Rate limiting configuration.
 * Controls how many requests a single client can make within a time window.
 */
export interface BoilrRateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window.
   * @default 100
   */
  max?: number;
  /**
   * Time window in milliseconds for the rate limit counter.
   * @default 60000 (1 minute)
   */
  windowMs?: number;
}

/**
 * Swagger/OpenAPI documentation configuration.
 * Controls the OpenAPI spec and Swagger UI served at `/docs`.
 */
export interface BoilrSwaggerConfig {
  /**
   * OpenAPI specification overrides.
   */
  openapi?: {
    /**
     * API metadata shown in the Swagger UI header.
     */
    info?: {
      /** API title displayed in Swagger UI. */
      title?: string;
      /** API description shown below the title. */
      description?: string;
      /** API version string (e.g. "1.0.0"). */
      version?: string;
    };
    /**
     * Server entries displayed in the Swagger UI server dropdown.
     *
     * @example
     * ```typescript
     * servers: [
     *   { url: "http://localhost:3000", description: "Development" },
     *   { url: "https://api.example.com", description: "Production" }
     * ]
     * ```
     */
    servers?: Array<{ url: string; description?: string }>;
  };
}

/**
 * Performance monitoring configuration.
 * Tracks request timing and logs slow endpoints.
 */
export interface BoilrMonitorConfig {
  /**
   * Threshold in milliseconds after which a request is considered slow.
   * @default 1000
   */
  slowThreshold?: number;
  /**
   * Threshold in milliseconds after which a request is considered very slow.
   * @default 3000
   */
  verySlowThreshold?: number;
  /**
   * Routes to exclude from monitoring. Accepts exact path strings
   * or RegExp patterns.
   *
   * @default ["/health", "/ready", "/metrics", "/docs", "/openapi.json", "/favicon.ico"]
   *
   * @example
   * ```typescript
   * exclude: ["/health", /\.(css|js|png)$/]
   * ```
   */
  exclude?: (string | RegExp)[];
}

/**
 * CORS (Cross-Origin Resource Sharing) configuration.
 * Controls which origins, methods, and headers are allowed in cross-origin requests.
 */
export interface BoilrCorsConfig {
  /**
   * Allowed origin(s). Set to `"*"` for any origin,
   * a single string for one origin, or an array for multiple.
   * @default "*"
   *
   * @example
   * ```typescript
   * origin: ["http://localhost:3000", "https://myapp.com"]
   * ```
   */
  origin?: string | string[];
  /**
   * HTTP methods allowed for cross-origin requests.
   * @default ["GET", "PUT", "POST", "DELETE", "PATCH"]
   */
  allowMethods?: string[];
  /**
   * Headers the client is allowed to send in cross-origin requests.
   */
  allowHeaders?: string[];
  /**
   * How long (in seconds) the browser should cache the preflight response.
   */
  maxAge?: number;
  /**
   * Whether to include credentials (cookies, authorization headers)
   * in cross-origin requests.
   * @default true
   */
  credentials?: boolean;
  /**
   * Response headers that the browser is allowed to access.
   */
  exposeHeaders?: string[];
}

/**
 * Security headers configuration (Helmet equivalent).
 * Sets HTTP response headers to protect against common web vulnerabilities.
 *
 * @see https://hono.dev/docs/middleware/builtin/secure-headers
 */
export interface BoilrHelmetConfig {
  /**
   * Content Security Policy directives.
   * Controls which resources the browser is allowed to load.
   */
  contentSecurityPolicy?: Record<string, unknown>;
  /**
   * Cross-Origin-Embedder-Policy header.
   * Set to `false` to disable, `true` for the default value, or a custom string.
   */
  crossOriginEmbedderPolicy?: boolean | string;
  /**
   * Cross-Origin-Resource-Policy header.
   */
  crossOriginResourcePolicy?: boolean | string;
  /**
   * Cross-Origin-Opener-Policy header.
   */
  crossOriginOpenerPolicy?: boolean | string;
  /**
   * Referrer-Policy header.
   */
  referrerPolicy?: boolean | string;
  /**
   * Strict-Transport-Security header (HSTS).
   */
  strictTransportSecurity?: boolean | string;
  /**
   * X-Content-Type-Options header. Prevents MIME-type sniffing.
   */
  xContentTypeOptions?: boolean | string;
  /**
   * X-Frame-Options header. Controls whether the page can be embedded in iframes.
   */
  xFrameOptions?: boolean | string;
  /**
   * Remove the X-Powered-By header from responses.
   * @default true
   */
  removePoweredBy?: boolean;
}

export interface BoilrPluginsConfig {
  /**
   * Cookie support.
   * In Hono, cookies are handled via built-in helpers (`getCookie`, `setCookie`).
   * Set to `false` to skip cookie-related setup.
   * @default true
   */
  cookie?: boolean;

  /**
   * Security headers (Helmet) configuration.
   * Set to `false` to disable, `true` for defaults, or an object for custom config.
   * @default true
   *
   * @see https://hono.dev/docs/middleware/builtin/secure-headers
   *
   * @example
   * ```typescript
   * helmet: {
   *   contentSecurityPolicy: { defaultSrc: ["'self'"] },
   *   crossOriginEmbedderPolicy: false
   * }
   * ```
   */
  helmet?: boolean | BoilrHelmetConfig;

  /**
   * Rate limiting configuration.
   * Set to `false` to disable, `true` for defaults, or an object for custom config.
   * @default true
   *
   * @example
   * ```typescript
   * rateLimit: {
   *   max: 100,
   *   windowMs: 60000
   * }
   * ```
   */
  rateLimit?: boolean | BoilrRateLimitConfig;

  /**
   * CORS (Cross-Origin Resource Sharing) configuration.
   * Set to `false` to disable, `true` for defaults, or an object for custom config.
   * @default true
   *
   * @example
   * ```typescript
   * cors: {
   *   origin: ["http://localhost:3000", "https://myapp.com"],
   *   credentials: true
   * }
   * ```
   */
  cors?: boolean | BoilrCorsConfig;

  /**
   * Swagger/OpenAPI documentation configuration.
   * Set to `false` to disable, `true` for defaults, or an object for custom config.
   * When enabled, serves interactive docs at `/docs` and the OpenAPI spec at `/openapi.json`.
   * @default true
   *
   * @example
   * ```typescript
   * swagger: {
   *   openapi: {
   *     info: {
   *       title: "My API",
   *       description: "API documentation",
   *       version: "1.0.0"
   *     },
   *     servers: [
   *       { url: "http://localhost:3000", description: "Development" }
   *     ]
   *   }
   * }
   * ```
   */
  swagger?: boolean | BoilrSwaggerConfig;

  /**
   * Performance monitoring configuration.
   * Tracks request timing and logs slow/very slow endpoints.
   * Set to `false` to disable, `true` for defaults, or an object for custom config.
   * @default true
   */
  monitor?: boolean | BoilrMonitorConfig;
}

/**
 * Middleware configuration for BoilrJs applications.
 *
 * @example
 * ```typescript
 * const middlewareConfig: BoilrMiddlewareConfig = {
 *   global: ["logger", "commonHeaders"]
 * };
 * ```
 */
export interface BoilrMiddlewareConfig {
  /**
   * Array of global middleware names to apply to all routes.
   * Middleware are applied in the order specified.
   * Built-in middleware: `"logger"`, `"commonHeaders"`.
   * Register custom middleware with `registerMiddleware()`.
   * @default ["logger", "commonHeaders"]
   *
   * @example
   * ```typescript
   * global: ["logger", "commonHeaders", "myCustomMiddleware"]
   * ```
   */
  global?: string[];
}

/**
 * Generic type for plugin options that includes boilrConfig.
 * Use this type for all plugin option interfaces to ensure consistent access to boilrConfig.
 */
// biome-ignore lint/complexity/noBannedTypes: boilrConfig wrapper
export type BoilrPluginOptions<T = {}> = T & { boilrConfig: BoilrConfig };

/**
 * Main configuration interface for BoilrJs applications.
 * This interface defines all available configuration options for customizing your BoilrJs app.
 *
 * @example
 * ```typescript
 * const app = createApp({
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
 *       openapi: {
 *         info: {
 *           title: "My API",
 *           version: "1.0.0"
 *         }
 *       }
 *     }
 *   },
 *   exceptions: {
 *     logErrors: true
 *   }
 * });
 * ```
 */
export interface BoilrConfig {
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
   * Authentication configuration.
   * Define auth methods that can be applied to routes.
   *
   * @example
   * ```typescript
   * auth: {
   *   methods: [
   *     {
   *       name: "bearer",
   *       type: "bearer",
   *       validator: async (request) => {
   *         const token = extractBearerToken(request);
   *         return await verifyJwtToken(token);
   *       }
   *     }
   *   ]
   * }
   * ```
   */
  auth?: AuthConfig;

  /**
   * Enable or disable request/response validation using Zod schemas.
   * @default true
   */
  validation?: boolean;

  /**
   * Exception handling configuration for HTTP errors and validation.
   * Configure custom error formatters, logging, and validation behavior.
   */
  exceptions?: ExceptionConfig;
}

/**
 * Default configuration values for BoilrJs applications.
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
    cookie: true,
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
