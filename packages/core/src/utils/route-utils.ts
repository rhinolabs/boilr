import type { FastifyRequest } from "fastify";
import type { CatchAllParam, HttpMethod, PathSegments, RouteSchema } from "../types/route-types";

/**
 * Validates and converts route parameters according to the schema
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
 * Special handler for catch-all route parameters
 * This helps with extracting and typing catch-all route segments
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
 * Validates and converts query parameters according to the schema
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
 * Validates and converts the request body according to the schema
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
