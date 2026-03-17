export interface FileRoutesOptions {
  routesDir: string;
  prefix?: string;
  options?: {
    ignore?: RegExp[];
    pathTransform?: (path: string, filename: string) => string;
    extensions?: string[];
  };
}

export type HttpMethod = "get" | "post" | "put" | "del" | "patch" | "head" | "options";

export type RouteHandler = (request: unknown, reply: unknown) => Promise<unknown> | unknown;

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
