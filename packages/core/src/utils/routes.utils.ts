import type { CatchAllParam, HttpMethod, PathSegments, RouteSchema } from "../types/routes.types.js";

/**
 * Validates and converts route parameters according to the schema.
 */
export const getTypedParams = <S extends RouteSchema, M extends HttpMethod>(
  request: { params: unknown },
  schema: S,
  method: M,
) => {
  const paramsSchema = schema[method]?.params || schema.params;

  if (!paramsSchema) {
    return request.params;
  }

  const result = paramsSchema.safeParse(request.params);
  if (!result.success) {
    throw new Error(`Invalid params: ${result.error.message}`);
  }

  return result.data;
};

export const getCatchAllParam = <T extends string = string>(
  params: PathSegments,
  paramName: string,
): CatchAllParam<T> => {
  const value = params[paramName];

  if (Array.isArray(value)) {
    return value as T[];
  }

  return value as T;
};

export const getTypedQuery = <S extends RouteSchema, M extends HttpMethod>(
  request: { query: unknown },
  schema: S,
  method: M,
) => {
  const querySchema = schema[method]?.querystring || schema.querystring;

  if (!querySchema) {
    return request.query;
  }

  const result = querySchema.safeParse(request.query);
  if (!result.success) {
    throw new Error(`Invalid query: ${result.error.message}`);
  }

  return result.data;
};

export const getTypedBody = <S extends RouteSchema, M extends HttpMethod>(
  request: { body: unknown },
  schema: S,
  method: M,
) => {
  const bodySchema = schema[method]?.body;

  if (!bodySchema) {
    return request.body;
  }

  const result = bodySchema.safeParse(request.body);
  if (!result.success) {
    throw new Error(`Invalid body: ${result.error.message}`);
  }

  return result.data;
};
