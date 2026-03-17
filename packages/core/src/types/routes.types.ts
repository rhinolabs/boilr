import { type ZodType, z } from "zod";
import type { BoilrAuthContext } from "./auth.types.js";

export type HttpMethod = "get" | "post" | "put" | "delete" | "patch" | "head" | "options";

export interface RouteSchema {
  // biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
  params?: ZodType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
  querystring?: ZodType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
  headers?: ZodType<any>;

  get?: MethodSchema;
  post?: MethodSchema;
  put?: MethodSchema;
  delete?: MethodSchema;
  patch?: MethodSchema;
  head?: MethodSchema;
  options?: MethodSchema;
}

export interface MethodSchema {
  auth?: string[] | false;
  tags?: string[];
  defaultErrorStatusCodes?: number[] | false;
  // biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
  params?: ZodType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
  querystring?: ZodType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
  headers?: ZodType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
  body?: ZodType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
  response?: Record<number, ZodType<any>>;
}

// Extract parameter types with inference
type ExtractParams<S extends RouteSchema, M extends HttpMethod> =
  S["params"] extends ZodType<infer P>
    ? S[M] extends { params: ZodType<infer MP> }
      ? P & MP
      : P
    : S[M] extends { params: ZodType<infer MP> }
      ? MP
      : unknown;

type ExtractQuery<S extends RouteSchema, M extends HttpMethod> =
  S["querystring"] extends ZodType<infer Q>
    ? S[M] extends { querystring: ZodType<infer MQ> }
      ? Q & MQ
      : Q
    : S[M] extends { querystring: ZodType<infer MQ> }
      ? MQ
      : unknown;

type ExtractHeaders<S extends RouteSchema, M extends HttpMethod> =
  S["headers"] extends ZodType<infer H>
    ? S[M] extends { headers: ZodType<infer MH> }
      ? H & MH
      : H
    : S[M] extends { headers: ZodType<infer MH> }
      ? MH
      : unknown;

type ExtractBody<S extends RouteSchema, M extends HttpMethod> = S[M] extends { body: ZodType<infer B> } ? B : unknown;

type ExtractResponse<S extends RouteSchema, M extends HttpMethod, Status extends number = 200> = S[M] extends {
  response: Record<Status, ZodType<infer R>>;
}
  ? R
  : unknown;

/**
 * Framework-agnostic typed request.
 * The adapter layer in the route-loader populates these fields from Hono's Context.
 */
export type TypedRequest<S extends RouteSchema, M extends HttpMethod> = {
  params: ExtractParams<S, M>;
  body: ExtractBody<S, M>;
  query: ExtractQuery<S, M>;
  headers: ExtractHeaders<S, M>;
  env: Record<string, unknown>;
  raw: Request;
} & (S[M] extends { auth: false } ? {} : { ctx: BoilrAuthContext });

/**
 * Framework-agnostic reply object provided by the adapter layer.
 */
export interface TypedReply {
  code: (status: number) => TypedReply;
  header: (name: string, value: string) => TypedReply;
  send: (data: unknown) => Response;
}

export type RouteHandler<
  S extends RouteSchema,
  M extends HttpMethod,
  Status extends number = M extends "post" ? 201 : 200,
> = (
  request: TypedRequest<S, M>,
  reply: TypedReply,
) => Promise<ExtractResponse<S, M, Status>> | ExtractResponse<S, M, Status>;

export type GetHandler<S extends RouteSchema> = RouteHandler<S, "get">;
export type PostHandler<S extends RouteSchema> = RouteHandler<S, "post", 201>;
export type PutHandler<S extends RouteSchema> = RouteHandler<S, "put">;
export type DeleteHandler<S extends RouteSchema> = RouteHandler<S, "delete">;
export type PatchHandler<S extends RouteSchema> = RouteHandler<S, "patch">;
export type HeadHandler<S extends RouteSchema> = RouteHandler<S, "head">;
export type OptionsHandler<S extends RouteSchema> = RouteHandler<S, "options">;

export const defineSchema = <T extends RouteSchema>(schema: T): T => {
  return schema;
};

export interface PathSegments {
  [key: string]: string | string[];
}

export type CatchAllParam<T extends string = string> = T[] | T;

export const catchAllSchema = <T extends z.ZodTypeAny>(innerType: T) => {
  return z.union([z.array(innerType), innerType]);
};
