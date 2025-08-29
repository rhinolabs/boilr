import { authPlugin } from "./auth.plugin.js";
import { cookiePlugin } from "./cookie.plugin.js";
import { corsPlugin } from "./cors.plugin.js";
import { helmetPlugin } from "./helmet.plugin.js";
import { monitorPlugin } from "./monitoring.plugin.js";
import { rateLimitPlugin } from "./rate-limit.plugin.js";
import { swaggerPlugin } from "./swagger.plugin.js";

export const plugins = {
  auth: authPlugin,
  cookie: cookiePlugin,
  helmet: helmetPlugin,
  rateLimit: rateLimitPlugin,
  swagger: swaggerPlugin,
  cors: corsPlugin,
  monitor: monitorPlugin,
};
