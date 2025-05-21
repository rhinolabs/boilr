import type { FastifySchema } from "fastify";
import {
  ZodTypeProvider,
  jsonSchemaTransform as baseJsonSchemaTransform,
  createJsonSchemaTransformObject,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

// Extended transform function that handles Swagger tags
// biome-ignore lint/suspicious/noExplicitAny: Adding properties to the object
function jsonSchemaTransform({ schema, url }: { schema: FastifySchema; url: string }): any {
  // First, apply the base transformation
  const transformed = baseJsonSchemaTransform({ schema, url });

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
