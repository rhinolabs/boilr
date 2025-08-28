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

export type AuthValidator = (request: FastifyRequest) => Promise<any> | any;

export interface AuthConfig {
  methods: AuthMethod[];
}

export interface BasicCredentials {
  username: string;
  password: string;
}
