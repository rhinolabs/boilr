import { corsPlugin } from "./cors.js";
import { monitorPlugin } from "./monitoring.js";
import { helmetPlugin, rateLimitPlugin } from "./security.js";
import { swaggerPlugin } from "./swagger.js";

export const plugins = {
  helmet: helmetPlugin,
  rateLimit: rateLimitPlugin,
  swagger: swaggerPlugin,
  cors: corsPlugin,
  monitor: monitorPlugin,
};
