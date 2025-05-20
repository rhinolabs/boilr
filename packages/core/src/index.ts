import fastify, {type FastifyInstance, type FastifyPluginOptions} from "fastify";
import {mergeConfig, type BoilrConfig} from "./core/config";
import {routerPlugin} from "./core/router";
import {decorateServer, type BoilrInstance} from "./core/server";
import {applyGlobalMiddleware} from "./middleware";
import {plugins} from "./plugins";
import {jsonSchemaTransform, serializerCompiler, validatorCompiler, type ZodTypeProvider} from "./validation";

/**
 * Creates a boilr application instance
 */
export function createApp(userConfig: BoilrConfig = {}): BoilrInstance {
  const config = mergeConfig(userConfig);

  const app = fastify(config.fastify);

  // Set up Zod validators and serializers
  if (config.validation !== false) {
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);
  }

  // Apply type provider
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // Register plugins
  if (config.plugins?.helmet !== false) {
    const helmetOptions = config.plugins?.helmet === true ? {} : config.plugins?.helmet || {};
    typedApp.register(plugins.helmet, helmetOptions as FastifyPluginOptions);
  }

  if (config.plugins?.rateLimit !== false) {
    const rateLimitOptions = config.plugins?.rateLimit === true ? {} : config.plugins?.rateLimit || {};
    typedApp.register(plugins.rateLimit, rateLimitOptions as FastifyPluginOptions);
  }

  if (config.plugins?.cors !== false) {
    const corsOptions = config.plugins?.cors === true ? {} : config.plugins?.cors || {};
    typedApp.register(plugins.cors, corsOptions as FastifyPluginOptions);
  }

  if (config.plugins?.swagger !== false) {
    // Configure Swagger with Zod transformation
    const swaggerOptions = config.plugins?.swagger === true ? {} : config.plugins?.swagger || {};
    const options = {
      ...swaggerOptions,
      transform: jsonSchemaTransform,
    };

    typedApp.register(plugins.swagger, options as FastifyPluginOptions);
  }

  // Register middleware
  if (config.middleware?.global) {
    for (const middleware of config.middleware.global) {
      applyGlobalMiddleware(typedApp, middleware);
    }
  }

  // Register routes
  typedApp.register(routerPlugin, {
    routesDir: config.routes?.dir,
    prefix: config.routes?.prefix,
  });

  return decorateServer(typedApp as unknown as FastifyInstance, config);
}

export { BoilrConfig } from "./core/config";
export { registerMiddleware, createRouteMiddleware } from "./middleware";
export { BoilrInstance } from "./core/server";
export { registerFileRoutes } from "./core/route-adapter";
export {
  ZodTypeProvider,
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform,
  createJsonSchemaTransformObject,
} from "./validation";