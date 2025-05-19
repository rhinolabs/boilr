import fastify, { FastifyInstance } from 'fastify';
import { mergeConfig, NoboilConfig } from './core/config';
import { decorateServer, NoboilInstance } from './core/server';
import { plugins } from './plugins';
import { routerPlugin } from './core/router';
import { applyGlobalMiddleware, registerMiddleware } from './middleware';
import { 
  ZodTypeProvider, 
  validatorCompiler, 
  serializerCompiler, 
  jsonSchemaTransform 
} from './validation';

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
    const options = config.plugins?.helmet === true ? {} : config.plugins?.helmet;
    typedApp.register(plugins.helmet, options);
  }
  
  if (config.plugins?.rateLimit !== false) {
    const options = config.plugins?.rateLimit === true ? {} : config.plugins?.rateLimit;
    typedApp.register(plugins.rateLimit, options);
  }
  
  if (config.plugins?.cors !== false) {
    const options = config.plugins?.cors === true ? {} : config.plugins?.cors;
    typedApp.register(plugins.cors, options);
  }
  
  if (config.plugins?.swagger !== false) {
    // Configure Swagger with Zod transformation
    const swaggerOptions = config.plugins?.swagger === true ? {} : config.plugins?.swagger;
    const options = {
      ...swaggerOptions,
      transform: jsonSchemaTransform
    };
    
    typedApp.register(plugins.swagger, options);
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
    prefix: config.routes?.prefix
  });
  
  // Decorate with additional methods
  const noboilApp = decorateServer(typedApp as unknown as FastifyInstance, config);
  
  noboilApp.decorate('registerMiddleware', registerMiddleware);
  
  return noboilApp;
}

export { NoboilConfig } from './core/config';
export { registerMiddleware, createRouteMiddleware } from './middleware';
export { NoboilInstance } from './core/server';
export { 
  ZodTypeProvider,
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform,
  createJsonSchemaTransformObject 
} from './validation';