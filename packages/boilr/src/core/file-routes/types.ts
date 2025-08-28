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

export interface FileRoutesOptions extends FastifyPluginOptions {
  routesDir: string;
  prefix?: string;
  options?: {
    ignore?: RegExp[];
    pathTransform?: (path: string, filename: string) => string;
    globalHooks?: Partial<RouteOptions>;
    extensions?: string[];
  };
}

export type HttpMethod = "get" | "post" | "put" | "del" | "patch" | "head" | "options";

export type RouteHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<unknown> | unknown;

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

export interface RouteModule {
  schema?: RouteSchema;
  hooks?: Partial<RouteOptions>;
  get?: RouteHandler;
  post?: RouteHandler;
  put?: RouteHandler;
  del?: RouteHandler;
  patch?: RouteHandler;
  head?: RouteHandler;
  options?: RouteHandler;
  default?: RouteHandler | Record<HttpMethod, RouteHandler>;
}

export interface RouteInfo {
  filePath: string;
  routePath: string;
  filename: string;
}

export type FastifyInstance = BaseFastifyInstance;

export type FastifyPluginAsync<Options extends FastifyPluginOptions = FastifyPluginOptions> = BasePluginAsync<
  Options,
  RawServerDefault,
  FastifyTypeProviderDefault
>;
