import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import type { SwaggerOptions } from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";
import { helmetPlugin, rateLimitPlugin } from "./security.js";

export const swaggerPlugin = fp(async (fastify: FastifyInstance, options: FastifyPluginOptions = {}) => {
  const defaultOptions: SwaggerOptions = {
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
  };

  const mergedOptions = { ...defaultOptions, ...options };

  await fastify.register(swagger, mergedOptions as SwaggerOptions);

  await fastify.register(swaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
    staticCSP: true,
  });
});

export const corsPlugin = fp(async (fastify: FastifyInstance, options: FastifyPluginOptions = {}) => {
  const defaultOptions = {
    origin: true,
    methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
    credentials: true,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  await fastify.register(cors, mergedOptions);
});

export const plugins = {
  helmet: helmetPlugin,
  rateLimit: rateLimitPlugin,
  swagger: swaggerPlugin,
  cors: corsPlugin,
};
