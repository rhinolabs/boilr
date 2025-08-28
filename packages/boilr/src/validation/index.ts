import type { FastifySchema, RouteOptions } from "fastify";
import {
  ZodTypeProvider,
  jsonSchemaTransform as baseJsonSchemaTransform,
  createJsonSchemaTransformObject,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import type { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { generateSecurityRequirement } from "../auth/swagger-utils.js";
import type { BoilrConfig } from "../core/config.js";
import { enhanceSchemaWithDefaultError } from "../schemas/enhancer.js";
import type { MethodSchema } from "../types/routes.types.js";

type TransformResult = ReturnType<typeof baseJsonSchemaTransform>;

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

      // Add OpenAPI operation properties to the schema
      if ("auth" in enhancedSchema) {
        const authConfig = enhancedSchema.auth;

        if (authConfig === false || (Array.isArray(authConfig) && authConfig.length === 0)) {
          // No security required - explicitly set empty security array
          (enhancedSchema as any).security = [];
        } else if (Array.isArray(authConfig)) {
          // Convert auth method names to security requirements
          const security = [generateSecurityRequirement(authConfig)];
          (enhancedSchema as any).security = security;
        } else if (authConfig === undefined && config.auth?.methods) {
          // Default: use all configured auth methods
          const allMethodNames = config.auth.methods.map((method) => method.name);
          const security = [generateSecurityRequirement(allMethodNames)];
          (enhancedSchema as any).security = security;
        }
      }
    }

    // Apply the base transformation with the enhanced schema
    const transformed = baseJsonSchemaTransform({
      schema: enhancedSchema,
      url,
      route,
      openapiObject,
    });

    return transformed;
  };
};

export { ZodTypeProvider, validatorCompiler, serializerCompiler, createJsonSchemaTransformObject };
