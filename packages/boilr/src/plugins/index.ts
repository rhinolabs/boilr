import { corsPlugin } from "./cors.js";
import { helmetPlugin } from "./helmet.js";
import { monitorPlugin } from "./monitoring.js";
import { rateLimitPlugin } from "./rate-limit.js";
import { swaggerPlugin } from "./swagger.js";

export const plugins = {
  helmet: helmetPlugin,
  rateLimit: rateLimitPlugin,
  swagger: swaggerPlugin,
  cors: corsPlugin,
  monitor: monitorPlugin,
};
