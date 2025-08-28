import fastify from "fastify";
import { type BoilrConfig, mergeConfig } from "./core/config.js";
import { routerPlugin } from "./core/router.js";
import { type BoilrInstance, decorateServer } from "./core/server.js";
import { createGlobalExceptionHandler } from "./exceptions/handler.js";
import { applyGlobalMiddleware } from "./middleware/index.js";
import { plugins } from "./plugins/index.js";
import {
  type ZodTypeProvider,
  createJsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "./validation/index.js";

/**
 * Creates a new Boilr application instance with the specified configuration.
 * This is the main entry point for creating Boilr applications.
 *
 * @param userConfig - Optional configuration object to customize the application
 * @returns A configured Boilr application instance ready to be started
 *
 * @example
 * ```typescript
 * // Basic usage with defaults
 * const app = createApp();
 *
 * // With custom configuration
 * const app = createApp({
 *   server: {
 *     port: 8080,
 *     host: "localhost"
 *   },
 *   routes: {
 *     dir: "./src/api",
 *     prefix: "/api/v1"
 *   },
 *   plugins: {
 *     swagger: {
 *       info: {
 *         title: "My API",
 *         version: "1.0.0"
 *       }
 *     }
 *   },
 *   exceptions: {
 *     formatter: (exception, request, reply) => ({
 *       statusCode: exception.statusCode,
 *       message: exception.message,
 *       error: exception.name.replace("Exception", ""),
 *       details: exception.details
 *     }),
 *     logErrors: true
 *   }
 * });
 *
 * // Start the server
 * await app.start();
 * ```
 */
export function createApp(userConfig: BoilrConfig = {}): BoilrInstance {
  const config = mergeConfig(userConfig);

  const app = fastify(config.fastify);

  // Set up global exception handler with configuration support
  const exceptionHandler = createGlobalExceptionHandler({
    formatter: config.exceptions?.formatter,
    logErrors: config.exceptions?.logErrors,
  });
  app.setErrorHandler(exceptionHandler);

  // Set up Zod validators and serializers
  if (config.validation !== false) {
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);
  }

  // Apply type provider
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // Register plugins
  if (config.plugins?.cookie !== false) {
    const cookieOptions = config.plugins?.cookie === true ? {} : config.plugins?.cookie || {};
    typedApp.register(plugins.cookie, cookieOptions);
  }

  if (config.plugins?.helmet !== false) {
    const helmetOptions = config.plugins?.helmet === true ? {} : config.plugins?.helmet || {};
    typedApp.register(plugins.helmet, helmetOptions);
  }

  if (config.plugins?.rateLimit !== false) {
    const rateLimitOptions = config.plugins?.rateLimit === true ? {} : config.plugins?.rateLimit || {};
    typedApp.register(plugins.rateLimit, rateLimitOptions);
  }

  if (config.plugins?.cors !== false) {
    const corsOptions = config.plugins?.cors === true ? {} : config.plugins?.cors || {};
    typedApp.register(plugins.cors, corsOptions);
  }

  if (config.plugins?.swagger !== false) {
    // Configure Swagger with Zod transformation and auth integration
    let swaggerOptions = config.plugins?.swagger === true ? {} : config.plugins?.swagger || {};
    swaggerOptions = {
      ...swaggerOptions,
      transform: createJsonSchemaTransform(config),
      boilrConfig: config,
    } as any;

    typedApp.register(plugins.swagger, swaggerOptions);
  }

  if (config.plugins?.monitor !== false) {
    const monitorOptions = config.plugins?.monitor === true ? {} : config.plugins?.monitor || {};
    typedApp.register(plugins.monitor, monitorOptions);
  }

  // Register authentication plugin
  if (config.auth) {
    typedApp.register(plugins.auth, { authConfig: config.auth });
  }

  // Register middleware
  if (config.middleware?.global) {
    for (const middleware of config.middleware.global) {
      applyGlobalMiddleware(typedApp, middleware);
    }
  }

  // Register routes
  typedApp.register(routerPlugin, config.routes || {});

  return decorateServer(typedApp, config);
}
