import type { FastifySchema, RouteOptions } from "fastify";
import {
  ZodTypeProvider,
  jsonSchemaTransform as baseJsonSchemaTransform,
  createJsonSchemaTransformObject,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import type { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

type TransformResult = ReturnType<typeof baseJsonSchemaTransform> & {
  tags?: string[];
};

type RouteContext = {
    schema: FastifySchema;
    url: string;
    route: RouteOptions;
    openapiObject?: Partial<OpenAPIV3.Document | OpenAPIV3_1.Document>;
}

// Extended transform function that handles Swagger tags
function jsonSchemaTransform({ schema, url, route, openapiObject }: RouteContext): TransformResult {
  if (!openapiObject) {
    throw new Error("openapiObject is missing in the transform context. This should not happen.");
  }
  // First, apply the base transformation
  const transformed = baseJsonSchemaTransform({ schema, url, route, openapiObject });
  // Check if the schema has tags and include them in the transformation
  if (schema && typeof schema === "object" && "tags" in schema) {
    const tags = schema.tags;
    if (Array.isArray(tags) && tags.length > 0) {
      return {
        ...transformed,
        tags,
      };
    }
  }

  return transformed;
}

export { ZodTypeProvider, validatorCompiler, serializerCompiler, createJsonSchemaTransformObject, jsonSchemaTransform };
