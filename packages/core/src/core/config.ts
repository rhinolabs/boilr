import type { FastifyServerOptions } from "fastify";

export interface NoboilServerConfig {
  port?: number;
  host?: string;
  logger?: boolean | object;
  [key: string]: any;
}

export interface NoboilRoutesConfig {
  dir?: string;
  prefix?: string;
}

export interface NoboilPluginsConfig {
  helmet?: boolean | object;
  rateLimit?: boolean | object;
  cors?: boolean | object;
  swagger?: boolean | object;
  [key: string]: any;
}

export interface NoboilMiddlewareConfig {
  global?: string[];
  [key: string]: any;
}

export interface NoboilConfig {
  server?: NoboilServerConfig;
  routes?: NoboilRoutesConfig;
  plugins?: NoboilPluginsConfig;
  middleware?: NoboilMiddlewareConfig;
  validation?: boolean;
  fastify?: FastifyServerOptions;
}

export const defaultConfig: NoboilConfig = {
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

export function mergeConfig(userConfig: NoboilConfig = {}): NoboilConfig {
  return {
    server: { ...defaultConfig.server, ...userConfig.server },
    routes: { ...defaultConfig.routes, ...userConfig.routes },
    plugins: { ...defaultConfig.plugins, ...userConfig.plugins },
    middleware: { ...defaultConfig.middleware, ...userConfig.middleware },
    validation: userConfig.validation !== undefined ? userConfig.validation : defaultConfig.validation,
    fastify: userConfig.fastify || {},
  };
}
