import { swaggerUI } from "@hono/swagger-ui";
import type { OpenAPIHono } from "@hono/zod-openapi";
import type { BoilrConfig, BoilrSwaggerConfig } from "../core/config.js";
import type { BoilrEnv } from "../types/fastify.types.js";
import { generateSecuritySchemes } from "../utils/swagger.utils.js";

export function registerSwagger(app: OpenAPIHono<BoilrEnv>, config: BoilrConfig): void {
  let swaggerConfig: BoilrSwaggerConfig = {};
  if (typeof config.plugins?.swagger === "object") {
    swaggerConfig = config.plugins.swagger;
  }

  const securitySchemes = generateSecuritySchemes(config.auth);
  const hasSchemes = securitySchemes && Object.keys(securitySchemes).length > 0;

  // Register the OpenAPI JSON endpoint
  app.doc("/openapi.json", {
    openapi: "3.1.0",
    info: {
      title: swaggerConfig.openapi?.info?.title || "API Documentation",
      description: swaggerConfig.openapi?.info?.description || "API documentation generated with BoilrJs",
      version: swaggerConfig.openapi?.info?.version || "1.0.0",
    },
    ...(swaggerConfig.openapi?.servers ? { servers: swaggerConfig.openapi.servers } : {}),
    ...(hasSchemes
      ? {
          components: {
            // biome-ignore lint/suspicious/noExplicitAny: OpenAPI security schemes typing
            securitySchemes: securitySchemes as any,
          },
        }
      : {}),
  });

  // Register Swagger UI
  app.get("/docs", swaggerUI({ url: "/openapi.json" }));
}
