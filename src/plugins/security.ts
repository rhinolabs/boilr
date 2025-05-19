import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export const helmetPlugin = fp(async function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions = {}
) {
  const defaultOptions = {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:']
      }
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  await fastify.register(helmet, mergedOptions);
});

export const rateLimitPlugin = fp(async function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions = {}
) {
  const defaultOptions = {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (req, context) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded, retry in ${context.after}`
    })
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  await fastify.register(rateLimit, mergedOptions);
});