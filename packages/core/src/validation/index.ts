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
import { generateSecurityRequirement } from "../utils/swagger.utils.js";

type TransformResult = ReturnType<typeof baseJsonSchemaTransform>;

type RouteContext = {
  schema: FastifySchema;
  url: string;
  route: RouteOptions;
  openapiObject?: Partial<OpenAPIV3.Document | OpenAPIV3_1.Document>;
};

/**
 * Creates a jsonSchemaTransform function with access to BoilrJs configuration
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

      // Add OpenAPI operation properties to the schema
      if (config.auth?.methods) {
        const authConfig = "auth" in enhancedSchema ? enhancedSchema.auth : undefined;

        if (authConfig === false || (Array.isArray(authConfig) && authConfig.length === 0)) {
          // No security required - explicitly set empty security array
          enhancedSchema.security = [];
        } else if (Array.isArray(authConfig)) {
          // Convert auth method names to security requirements
          enhancedSchema.security = [generateSecurityRequirement(authConfig)];
        } else {
          // Default: use only auth methods with default !== false when auth is not specified
          const defaultMethodNames = config.auth.methods
            .filter((method) => method.default !== false)
            .map((method) => method.name);
          enhancedSchema.security = [generateSecurityRequirement(defaultMethodNames)];
        }
      }
    }

    // Apply the base transformation with the enhanced schema
    return baseJsonSchemaTransform({
      schema: enhancedSchema,
      url,
      route,
      openapiObject,
    });
  };
};

export { ZodTypeProvider, validatorCompiler, serializerCompiler, createJsonSchemaTransformObject };
