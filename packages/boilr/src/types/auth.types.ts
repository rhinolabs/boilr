import type { FastifyRequest } from "fastify";

export type AuthType = "bearer" | "apiKey" | "basic" | "cookie";

export type AuthLocation = "header" | "query" | "cookie";

export interface AuthMethodOptions {
  key?: string;
  location?: AuthLocation;
}

export interface AuthMethod {
  name: string;
  type: AuthType;
  options?: AuthMethodOptions;
  validator: AuthValidator;
}

export type AuthValidator = (request: FastifyRequest) => Promise<BoilrAuthContext> | BoilrAuthContext;

export interface AuthConfig {
  methods: AuthMethod[];
}

export interface BasicCredentials {
  username: string;
  password: string;
}

/**
 * Global namespace for Boilr type extensions.
 * Users can extend these interfaces to customize type behavior.
 */
declare global {
  namespace Boilr {
    /**
     * Authentication context interface that users can extend.
     * By default, it's unknown, but users can extend it with their own context.
     *
     * @example
     * ```typescript
     * declare global {
     *   namespace Boilr {
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
