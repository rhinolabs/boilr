import swagger, { type FastifyDynamicSwaggerOptions } from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { generateSecuritySchemes } from "../utils/swagger.utils.js";
import type { BoilrConfig } from "../core/config.js";
import { mergeConfigRecursively } from "../utils/config.utils.js";

/**
 * Swagger documentation plugin that automatically generates OpenAPI specs and provides
 * an interactive documentation interface at /docs endpoint.
 *
 * For configuration options, see: https://www.npmjs.com/package/@fastify/swagger
 */
export const swaggerPlugin = fp(
  async (fastify: FastifyInstance, options: FastifyDynamicSwaggerOptions & { boilrConfig?: BoilrConfig } = {}) => {
    const { boilrConfig, ...swaggerOptions } = options;

    // Generate security schemes from auth configuration
    const securitySchemes = generateSecuritySchemes(boilrConfig?.auth);

    // Enhance the default options for better documentation
    const defaultOptions: FastifyDynamicSwaggerOptions = {
      openapi: {
        info: {
          title: "API Documentation",
          description: "API documentation generated with boilr",
          version: "1.0.0",
        },
        components: {
          securitySchemes,
        },
      },
      // Enable Swagger on all routes by default
      mode: "dynamic",
      hideUntagged: false,
    };

    const mergedOptions = mergeConfigRecursively(defaultOptions, swaggerOptions);

    // Register swagger schema generator
    await fastify.register(swagger, mergedOptions);

    // Configure Swagger UI with improved settings
    await fastify.register(swaggerUI, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "list",
        deepLinking: true,
        defaultModelExpandDepth: 3,
        defaultModelsExpandDepth: 3,
        displayRequestDuration: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
    });
  },
);
