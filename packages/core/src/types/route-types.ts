import type { FastifyReply, FastifyRequest } from "fastify";
import { type ZodType, z } from "zod";

// Supported HTTP methods
export type HttpMethod = "get" | "post" | "put" | "delete" | "patch" | "head" | "options";

// Base route schema
export interface RouteSchema {
  // Common schemas for all methods
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    params?: ZodType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  querystring?: ZodType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  headers?: ZodType<any>;

  // Method-specific schemas
  get?: MethodSchema;
  post?: MethodSchema;
  put?: MethodSchema;
  delete?: MethodSchema;
  patch?: MethodSchema;
  head?: MethodSchema;
  options?: MethodSchema;
}

// Schema for a specific HTTP method
export interface MethodSchema {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  params?: ZodType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  querystring?: ZodType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  headers?: ZodType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  body?: ZodType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  response?: Record<number, ZodType<any>>;
}

// Extract parameter types with inference
type ExtractParams<S extends RouteSchema, M extends HttpMethod> = S["params"] extends ZodType<infer P>
  ? S[M] extends { params: ZodType<infer MP> }
    ? P & MP
    : P
  : S[M] extends { params: ZodType<infer MP> }
    ? MP
    : unknown;

// Extract query types with inference
type ExtractQuery<S extends RouteSchema, M extends HttpMethod> = S["querystring"] extends ZodType<infer Q>
  ? S[M] extends { querystring: ZodType<infer MQ> }
    ? Q & MQ
    : Q
  : S[M] extends { querystring: ZodType<infer MQ> }
    ? MQ
    : unknown;

// Extract header types with inference
type ExtractHeaders<S extends RouteSchema, M extends HttpMethod> = S["headers"] extends ZodType<infer H>
  ? S[M] extends { headers: ZodType<infer MH> }
    ? H & MH
    : H
  : S[M] extends { headers: ZodType<infer MH> }
    ? MH
    : unknown;

// Extract body types with inference
type ExtractBody<S extends RouteSchema, M extends HttpMethod> = S[M] extends { body: ZodType<infer B> } ? B : unknown;

// Extract response types with status code inference
type ExtractResponse<S extends RouteSchema, M extends HttpMethod, Status extends number = 200> = S[M] extends {
  response: Record<Status, ZodType<infer R>>;
}
  ? R
  : unknown;

// Tipo para request tipado según el esquema
export type TypedRequest<S extends RouteSchema, M extends HttpMethod> = FastifyRequest<{
  Params: ExtractParams<S, M>;
  Querystring: ExtractQuery<S, M>;
  Headers: ExtractHeaders<S, M>;
  Body: ExtractBody<S, M>;
}>;

// Tipo genérico para handlers con tipos inferidos
export type RouteHandler<
  S extends RouteSchema,
  M extends HttpMethod,
  Status extends number = M extends "post" ? 201 : 200,
> = (
  request: TypedRequest<S, M>,
  reply: FastifyReply,
) => Promise<ExtractResponse<S, M, Status>> | ExtractResponse<S, M, Status>;

// Tipos específicos para cada método HTTP
export type GetHandler<S extends RouteSchema> = RouteHandler<S, "get">;
export type PostHandler<S extends RouteSchema> = RouteHandler<S, "post", 201>;
export type PutHandler<S extends RouteSchema> = RouteHandler<S, "put">;
export type DeleteHandler<S extends RouteSchema> = RouteHandler<S, "delete">;
export type PatchHandler<S extends RouteSchema> = RouteHandler<S, "patch">;
export type HeadHandler<S extends RouteSchema> = RouteHandler<S, "head">;
export type OptionsHandler<S extends RouteSchema> = RouteHandler<S, "options">;

// Utility for defining schemas with type inference
export function defineSchema<T extends RouteSchema>(schema: T): T {
  return schema;
}

// Type for catching path segments in dynamic routes
export interface PathSegments {
  [key: string]: string | string[];
}

// Helper type for catch-all route params
export type CatchAllParam<T extends string = string> = T[] | T;

// Helper for creating catch-all param schemas
export function catchAllSchema<T extends z.ZodTypeAny>(innerType: T) {
  return z.union([z.array(innerType), innerType]);
}
