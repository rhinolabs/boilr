import type { BoilrConfig, BoilrInstance } from "@rhinolabs/boilr";
import type { HTTPMethods } from "fastify";

export interface TestAppConfig extends Partial<BoilrConfig> {
  silent?: boolean;
  database?: {
    setup?: () => Promise<void>;
    teardown?: () => Promise<void>;
  };
}

export interface TestContext {
  app: BoilrInstance;
  cleanup: () => Promise<void>;
}

export interface MockRequestOptions {
  method?: HTTPMethods | string;
  url?: string;
  headers?: Record<string, string>;
  query?: Record<string, unknown>;
  payload?: unknown;
  cookies?: Record<string, string>;
}

export interface AuthTestOptions {
  type: 'bearer' | 'apiKey' | 'basic' | 'cookie';
  value: string;
  location?: 'header' | 'query' | 'cookie';
}