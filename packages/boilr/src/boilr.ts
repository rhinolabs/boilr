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
 * Creates a new BoilrJs application instance with the specified configuration.
 * This is the main entry point for creating BoilrJs applications.
 *
 * @param userConfig - Optional configuration object to customize the application
 * @returns A configured BoilrJs application instance ready to be started
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

  // Create boilrjs instance early to access addPlugin method
  const boilrApp = decorateServer(typedApp, config);

  // Register plugins using addPlugin
  if (config.plugins?.cookie !== false) {
    boilrApp.addPlugin(plugins.cookie);
  }

  if (config.plugins?.helmet !== false) {
    boilrApp.addPlugin(plugins.helmet);
  }

  if (config.plugins?.rateLimit !== false) {
    boilrApp.addPlugin(plugins.rateLimit);
  }

  if (config.plugins?.cors !== false) {
    boilrApp.addPlugin(plugins.cors);
  }

  if (config.plugins?.swagger !== false) {
    const swaggerOptions = {
      transform: createJsonSchemaTransform(config),
    };
    boilrApp.addPlugin(plugins.swagger, swaggerOptions);
  }

  if (config.plugins?.monitor !== false) {
    boilrApp.addPlugin(plugins.monitor);
  }

  // Register authentication plugin
  if (config.auth) {
    boilrApp.addPlugin(plugins.auth);
  }

  // Register middleware
  if (config.middleware?.global) {
    for (const middleware of config.middleware.global) {
      applyGlobalMiddleware(boilrApp, middleware);
    }
  }

  // Register routes
  boilrApp.register(routerPlugin, config.routes || {});

  return boilrApp;
}
