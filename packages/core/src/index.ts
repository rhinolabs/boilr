import fastify, { type FastifyInstance, type FastifyPluginOptions } from "fastify";
import { type NoboilConfig, mergeConfig } from "./core/config";
import { routerPlugin } from "./core/router";
import { type NoboilInstance, decorateServer } from "./core/server";
import { applyGlobalMiddleware, registerMiddleware } from "./middleware";
import { plugins } from "./plugins";
import { type ZodTypeProvider, jsonSchemaTransform, serializerCompiler, validatorCompiler } from "./validation";

/**
 * Creates a noboil application instance
 */
export function createApp(userConfig: NoboilConfig = {}): NoboilInstance {
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

  // Decorate with additional methods
  const noboilApp = decorateServer(typedApp as unknown as FastifyInstance, config);

  return noboilApp;
}

export { NoboilConfig } from "./core/config";
export { registerMiddleware, createRouteMiddleware } from "./middleware";
export { NoboilInstance } from "./core/server";
export {
  ZodTypeProvider,
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform,
  createJsonSchemaTransformObject,
} from "./validation";
