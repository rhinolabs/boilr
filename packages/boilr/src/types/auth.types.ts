import type { FastifyRequest } from "fastify";

export type AuthType = "bearer" | "apiKey" | "basic" | "cookie";

export type AuthLocation = "header" | "query" | "cookie";

export interface AuthMethodOptions {
  key?: string;
  location?: AuthLocation;
}

export interface BearerAuthMethod {
  name: string;
  type: "bearer";
  options?: AuthMethodOptions;
  validator: BearerAuthValidator;
  default?: boolean;
}

export interface ApiKeyAuthMethod {
  name: string;
  type: "apiKey";
  options?: AuthMethodOptions;
  validator: ApiKeyAuthValidator;
  default?: boolean;
}

export interface CookieAuthMethod {
  name: string;
  type: "cookie";
  options?: AuthMethodOptions;
  validator: CookieAuthValidator;
  default?: boolean;
}

export interface BasicAuthMethod {
  name: string;
  type: "basic";
  options?: AuthMethodOptions;
  validator: BasicAuthValidator;
  default?: boolean;
}

export type AuthMethod = BearerAuthMethod | ApiKeyAuthMethod | CookieAuthMethod | BasicAuthMethod;

export type BearerAuthValidator = (
  request: FastifyRequest,
  token: string | undefined,
) => Promise<BoilrAuthContext> | BoilrAuthContext;
export type ApiKeyAuthValidator = (
  request: FastifyRequest,
  token: string | undefined,
) => Promise<BoilrAuthContext> | BoilrAuthContext;
export type CookieAuthValidator = (
  request: FastifyRequest,
  token: string | undefined,
) => Promise<BoilrAuthContext> | BoilrAuthContext;
export type BasicAuthValidator = (
  request: FastifyRequest,
  username: string | undefined,
  password: string | undefined,
) => Promise<BoilrAuthContext> | BoilrAuthContext;

export type AuthValidator = BearerAuthValidator | ApiKeyAuthValidator | CookieAuthValidator | BasicAuthValidator;

export interface AuthConfig {
  methods: AuthMethod[];
}

export interface BasicCredentials {
  username: string;
  password: string;
}

/**
 * Global namespace for BoilrJs type extensions.
 * Users can extend these interfaces to customize type behavior.
 */
declare global {
  namespace BoilrJs {
    /**
     * Authentication context interface that users can extend.
     * By default, it's unknown, but users can extend it with their own context.
     *
     * @example
     * ```typescript
     * declare global {
     *   namespace BoilrJs {
     *     interface AuthContext {
     *       userId: string;
     *       role: 'admin' | 'user';
     *       permissions: string[];
     *     }
     *   }
     * }
     * ```
     */
    interface AuthContext {}
  }
}

/**
 * Type alias for the extensible auth context.
 * Defaults to unknown if not extended by the user.
 */
export type BoilrAuthContext = Boilr.AuthContext extends Record<string, never> ? unknown : Boilr.AuthContext;
