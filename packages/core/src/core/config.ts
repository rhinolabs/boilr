import type { AuthConfig } from "../types/auth.types.js";
import type { ExceptionConfig } from "../types/error.types.js";
import { mergeConfigRecursively } from "../utils/config.utils.js";

export interface BoilrServerConfig {
  port?: number;
  host?: string;
  logger?: boolean | object;
}

export interface BoilrRoutesConfig {
  dir?: string;
  prefix?: string;
  options?: {
    ignore?: RegExp[];
    extensions?: string[];
  };
}

export interface BoilrRateLimitConfig {
  max?: number;
  windowMs?: number;
}

export interface BoilrSwaggerConfig {
  openapi?: {
    info?: {
      title?: string;
      description?: string;
      version?: string;
    };
    servers?: Array<{ url: string; description?: string }>;
  };
}

export interface BoilrMonitorConfig {
  slowThreshold?: number;
  verySlowThreshold?: number;
  exclude?: (string | RegExp)[];
}

export interface BoilrCorsConfig {
  origin?: string | string[];
  allowMethods?: string[];
  allowHeaders?: string[];
  maxAge?: number;
  credentials?: boolean;
  exposeHeaders?: string[];
}

export interface BoilrHelmetConfig {
  contentSecurityPolicy?: Record<string, unknown>;
  crossOriginEmbedderPolicy?: boolean | string;
  crossOriginResourcePolicy?: boolean | string;
  crossOriginOpenerPolicy?: boolean | string;
  referrerPolicy?: boolean | string;
  strictTransportSecurity?: boolean | string;
  xContentTypeOptions?: boolean | string;
  xFrameOptions?: boolean | string;
  removePoweredBy?: boolean;
}

export interface BoilrPluginsConfig {
  cookie?: boolean;
  helmet?: boolean | BoilrHelmetConfig;
  rateLimit?: boolean | BoilrRateLimitConfig;
  cors?: boolean | BoilrCorsConfig;
  swagger?: boolean | BoilrSwaggerConfig;
  monitor?: boolean | BoilrMonitorConfig;
}

export interface BoilrMiddlewareConfig {
  global?: string[];
}

// biome-ignore lint/complexity/noBannedTypes: boilrConfig wrapper
export type BoilrPluginOptions<T = {}> = T & { boilrConfig: BoilrConfig };

export interface BoilrConfig {
  server?: BoilrServerConfig;
  routes?: BoilrRoutesConfig;
  plugins?: BoilrPluginsConfig;
  middleware?: BoilrMiddlewareConfig;
  auth?: AuthConfig;
  validation?: boolean;
  exceptions?: ExceptionConfig;
}

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

export function mergeConfig(userConfig: BoilrConfig = {}): BoilrConfig {
  return mergeConfigRecursively(defaultConfig, userConfig);
}
