import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { helmetPlugin, rateLimitPlugin } from './security';

export const swaggerPlugin = fp(async function(
  fastify: FastifyInstance,
  options: FastifyPluginOptions = {}
) {
  const defaultOptions = {
    openapi: {
      info: {
        title: 'API Documentation',
        description: 'API documentation generated with noboil',
        version: '1.0.0'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  await fastify.register(swagger, mergedOptions);
  
  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true
    },
    staticCSP: true
  });
});

export const corsPlugin = fp(async function(
  fastify: FastifyInstance,
  options: FastifyPluginOptions = {}
) {
  const defaultOptions = {
    origin: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
    credentials: true
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  await fastify.register(cors, mergedOptions);
});

export const plugins = {
  helmet: helmetPlugin,
  rateLimit: rateLimitPlugin,
  swagger: swaggerPlugin,
  cors: corsPlugin
};