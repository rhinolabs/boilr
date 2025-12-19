import type { FastifyRequest } from "fastify";
import type { CatchAllParam, HttpMethod, PathSegments, RouteSchema } from "../types/routes.types.js";

/**
 * Validates and converts route parameters according to the schema.
 * This function provides type-safe access to route parameters with automatic validation.
 *
 * @template S - The route schema type
 * @template M - The HTTP method type
 * @param request - The Fastify request object
 * @param schema - The route schema definition
 * @param method - The HTTP method being handled
 * @returns Validated and typed route parameters
 *
 * @throws {Error} When parameters don't match the schema
 *
 * @example
 * ```typescript
 * export const get: GetHandler<typeof schema> = async (request, reply) => {
 *   // Automatic validation - usually you don't need to call this directly
 *   // as BoilrJs handles it automatically, but it's available if needed
 *   const params = getTypedParams(request, schema, "get");
 *   const { id } = params; // Fully typed
 * };
 * ```
 */
export function getTypedParams<S extends RouteSchema, M extends HttpMethod>(
  request: FastifyRequest,
  schema: S,
  method: M,
) {
  // Combine global and method-specific param schemas
  const paramsSchema = schema[method]?.params || schema.params;

  if (!paramsSchema) {
    return request.params;
  }

  // Handle a special case for catch-all params (they come as arrays)
  const params = request.params;

  // Parse and validate with Zod
  const result = paramsSchema.safeParse(params);
  if (!result.success) {
    throw new Error(`Invalid params: ${result.error.message}`);
  }

  return result.data;
}

/**
 * Special handler for catch-all route parameters.
 * This utility helps extract and type catch-all route segments like `/files/[...path]`.
 *
 * @template T - The type of individual path segments
 * @param params - The route parameters object
 * @param paramName - The name of the catch-all parameter
 * @returns Either an array of path segments or a single segment
 *
 * @example
 * ```typescript
 * // For a route like /files/[...path]
 * export const get: GetHandler<typeof schema> = async (request, reply) => {
 *   const filePath = getCatchAllParam(request.params, "path");
 *
 *   if (Array.isArray(filePath)) {
 *     // Handle multiple segments: ["folder", "subfolder", "file.txt"]
 *     const fullPath = filePath.join("/");
 *   } else {
 *     // Handle single segment: "file.txt"
 *     const fullPath = filePath;
 *   }
 * };
 * ```
 */
export function getCatchAllParam<T extends string = string>(params: PathSegments, paramName: string): CatchAllParam<T> {
  const value = params[paramName];

  // Handle both array and string cases
  if (Array.isArray(value)) {
    return value as T[];
  }

  return value as T;
}

/**
 * Validates and converts query parameters according to the schema.
 * This function provides type-safe access to query string parameters with automatic validation.
 *
 * @template S - The route schema type
 * @template M - The HTTP method type
 * @param request - The Fastify request object
 * @param schema - The route schema definition
 * @param method - The HTTP method being handled
 * @returns Validated and typed query parameters
 *
 * @throws {Error} When query parameters don't match the schema
 *
 * @example
 * ```typescript
 * export const get: GetHandler<typeof schema> = async (request, reply) => {
 *   // Usually handled automatically by Boilr, but available for manual use
 *   const query = getTypedQuery(request, schema, "get");
 *   const { page, limit } = query; // Fully typed
 * };
 * ```
 */
export function getTypedQuery<S extends RouteSchema, M extends HttpMethod>(
  request: FastifyRequest,
  schema: S,
  method: M,
) {
  // Similar a getTypedParams
  const querySchema = schema[method]?.querystring || schema.querystring;

  if (!querySchema) {
    return request.query;
  }

  const result = querySchema.safeParse(request.query);
  if (!result.success) {
    throw new Error(`Invalid query: ${result.error.message}`);
  }

  return result.data;
}

/**
 * Validates and converts the request body according to the schema.
 * This function provides type-safe access to request body data with automatic validation.
 *
 * @template S - The route schema type
 * @template M - The HTTP method type
 * @param request - The Fastify request object
 * @param schema - The route schema definition
 * @param method - The HTTP method being handled
 * @returns Validated and typed request body
 *
 * @throws {Error} When the request body doesn't match the schema
 *
 * @example
 * ```typescript
 * export const post: PostHandler<typeof schema> = async (request, reply) => {
 *   // Usually handled automatically by Boilr, but available for manual use
 *   const body = getTypedBody(request, schema, "post");
 *   const { name, email } = body; // Fully typed
 * };
 * ```
 */
export function getTypedBody<S extends RouteSchema, M extends HttpMethod>(
  request: FastifyRequest,
  schema: S,
  method: M,
) {
  const bodySchema = schema[method]?.body;

  if (!bodySchema) {
    return request.body;
  }

  const result = bodySchema.safeParse(request.body);
  if (!result.success) {
    throw new Error(`Invalid body: ${result.error.message}`);
  }

  return result.data;
}
