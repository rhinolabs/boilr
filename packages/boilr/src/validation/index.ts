import type { FastifySchema, RouteOptions } from "fastify";
import {
  ZodTypeProvider,
  jsonSchemaTransform as baseJsonSchemaTransform,
  createJsonSchemaTransformObject,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import type { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import type { BoilrConfig } from "../core/config.js";
import { enhanceSchemaWithDefaultError } from "../schemas/enhancer.js";
import type { MethodSchema } from "../types/routes.types.js";

type TransformResult = ReturnType<typeof baseJsonSchemaTransform> & {
  tags?: string[];
};

type RouteContext = {
  schema: FastifySchema;
  url: string;
  route: RouteOptions;
  openapiObject?: Partial<OpenAPIV3.Document | OpenAPIV3_1.Document>;
};

/**
 * Creates a jsonSchemaTransform function with access to Boilr configuration
 */
export const createJsonSchemaTransform = (config: BoilrConfig) => {
  return function jsonSchemaTransform({ schema, url, route, openapiObject }: RouteContext): TransformResult {
    if (!openapiObject) {
      throw new Error("openapiObject is missing in the transform context. This should not happen.");
    }

    // Enhance schema with error responses if it's a RouteSchema
    let enhancedSchema = schema;
    if (schema && typeof schema === "object") {
      enhancedSchema = enhanceSchemaWithDefaultError(schema as MethodSchema, config.exceptions);
    }

    // Apply the base transformation
    const transformed = baseJsonSchemaTransform({
      schema: enhancedSchema,
      url,
      route,
      openapiObject,
    });

    // Check if the schema has tags and include them in the transformation
    if (enhancedSchema && typeof enhancedSchema === "object" && "tags" in enhancedSchema) {
      const tags = enhancedSchema.tags;
      if (Array.isArray(tags) && tags.length > 0) {
        return {
          ...transformed,
          tags,
        };
      }
    }

    return transformed;
  };
};

export { ZodTypeProvider, validatorCompiler, serializerCompiler, createJsonSchemaTransformObject };
