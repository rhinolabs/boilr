import swagger, { type FastifyDynamicSwaggerOptions } from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

/**
 * Swagger documentation plugin that automatically generates OpenAPI specs and provides
 * an interactive documentation interface at /docs endpoint.
 */
export const swaggerPlugin = fp(async (fastify: FastifyInstance, options: FastifyDynamicSwaggerOptions = {}) => {
  // Enhance the default options for better documentation
  const defaultOptions: FastifyDynamicSwaggerOptions = {
    openapi: {
      info: {
        title: "API Documentation",
        description: "API documentation generated with boilr",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    // Enable Swagger on all routes by default
    mode: "dynamic",
    hideUntagged: false,
  };

  const mergedOptions = { ...defaultOptions, ...options };

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
});
