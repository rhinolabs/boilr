import type { FastifyServerOptions } from "fastify";

export interface BoilrServerConfig {
  port?: number;
  host?: string;
  logger?: boolean | object;
}

export interface BoilrRoutesConfig {
  dir?: string;
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
  helmet?: boolean | object;
  rateLimit?: boolean | object;
  cors?: boolean | object;
  swagger?: boolean | object;
}

export interface BoilrMiddlewareConfig {
  global?: string[];
}

export interface BoilrConfig {
  server?: BoilrServerConfig;
  routes?: BoilrRoutesConfig;
  plugins?: BoilrPluginsConfig;
  middleware?: BoilrMiddlewareConfig;
  validation?: boolean;
  fastify?: FastifyServerOptions;
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
    helmet: true,
    rateLimit: true,
    cors: true,
    swagger: true,
  },
  middleware: {
    global: ["logger", "commonHeaders"],
  },
  validation: true,
};

export function mergeConfig(userConfig: BoilrConfig = {}): BoilrConfig {
  return {
    server: { ...defaultConfig.server, ...userConfig.server },
    routes: { ...defaultConfig.routes, ...userConfig.routes },
    plugins: { ...defaultConfig.plugins, ...userConfig.plugins },
    middleware: { ...defaultConfig.middleware, ...userConfig.middleware },
    validation: userConfig.validation !== undefined ? userConfig.validation : defaultConfig.validation,
    fastify: userConfig.fastify || {},
  };
}
