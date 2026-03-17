// Validation is handled by @hono/zod-openapi at route registration time.
// The route-loader bridges defineSchema() to createRoute() automatically.
// This module re-exports schema enhancement utilities.

export { enhanceSchemaWithDefaultError } from "../schemas/enhancer.js";
