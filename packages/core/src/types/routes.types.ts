import type { Handler } from "hono";
import { type ZodType, z } from "zod";
import type { BoilrEnv } from "./env.types.js";

/**
 * Supported HTTP methods in BoilrJs routes.
 *
 * @example
 * ```typescript
 * const method: HttpMethod = "get";
 * ```
 */
export type HttpMethod = "get" | "post" | "put" | "delete" | "patch" | "head" | "options";

/**
 * Base route schema configuration for defining API endpoints.
 * This interface allows you to define validation schemas that apply to all HTTP methods
 * or specific schemas for individual methods.
 *
 * @example
 * ```typescript
 * const schema: RouteSchema = {
 *   // Common schemas applied to all methods
 *   params: z.object({ id: z.string() }),
 *
 *   // Method-specific schemas
 *   get: {
 *     tags: ["Users"],
 *     response: { 200: UserSchema }
 *   },
 *   post: {
 *     tags: ["Users"],
 *     body: CreateUserSchema,
 *     response: { 201: UserSchema }
 *   }
 * };
 * ```
 */
export interface RouteSchema {
  /**
   * Common parameter validation schema applied to all HTTP methods.
   * Use this for route parameters like `/users/:id` that are shared across methods.
   *
   * @example
   * ```typescript
   * params: z.object({
   *   id: z.string().transform(val => parseInt(val, 10))
   * })
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
  params?: ZodType<any>;
  /**
   * Common query string validation schema applied to all HTTP methods.
   * Use this for query parameters that are shared across methods.
   *
   * @example
   * ```typescript
   * querystring: z.object({
   *   page: z.string().optional(),
   *   limit: z.string().optional()
   * })
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
  querystring?: ZodType<any>;
  /**
   * Common header validation schema applied to all HTTP methods.
   * Use this for headers that are shared across methods.
   *
   * @example
   * ```typescript
   * headers: z.object({
   *   authorization: z.string()
   * })
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
  headers?: ZodType<any>;

  /** GET method configuration */
  get?: MethodSchema;
  /** POST method configuration */
  post?: MethodSchema;
  /** PUT method configuration */
  put?: MethodSchema;
  /** DELETE method configuration */
  delete?: MethodSchema;
  /** PATCH method configuration */
  patch?: MethodSchema;
  /** HEAD method configuration */
  head?: MethodSchema;
  /** OPTIONS method configuration */
  options?: MethodSchema;
}

/**
 * Schema configuration for a specific HTTP method.
 * Defines validation schemas and documentation tags for individual HTTP methods.
 *
 * @example
 * ```typescript
 * const getMethodSchema: MethodSchema = {
 *   tags: ["Users", "Public"],
 *   params: z.object({
 *     id: z.string().transform(val => parseInt(val, 10))
 *   }),
 *   querystring: z.object({
 *     include: z.array(z.string()).optional()
 *   }),
 *   response: {
 *     200: UserSchema,
 *     404: ErrorSchema
 *   }
 * };
 * ```
 */
export interface MethodSchema {
  /**
   * Authentication configuration for this method.
   * - `false` or `[]`: Makes the route public (no auth required)
   * - `string[]`: Array of auth method names that can be used (OR logic)
   * - `undefined`: Uses all configured auth methods by default
   *
   * @example
   * ```typescript
   * auth: false // Public route
   * auth: [] // Public route
   * auth: ["bearer"] // Only JWT Bearer tokens
   * auth: ["bearer", "apiKey"] // JWT or API key
   * ```
   */
  auth?: string[] | false;
  /**
   * Swagger tags for grouping and organizing API endpoints in documentation.
   *
   * @example
   * ```typescript
   * tags: ["Users"] // Single tag
   * tags: ["Users", "Admin"] // Multiple tags
   * ```
   */
  tags?: string[];
  /**
   * HTTP status codes for which to include default error response schemas for this method.
   * Overrides global configuration when specified. Use false or empty array to disable completely.
   *
   * @example
   * ```typescript
   * defaultErrorStatusCodes: [401, 500] // Only include 401 and 500 schemas
   * defaultErrorStatusCodes: false // Disable all default error schemas for this method
   * ```
   */
  defaultErrorStatusCodes?: number[] | false;
  /**
   * Route parameter validation schema specific to this method.
   * Overrides or extends the common params schema defined at the route level.
   *
   * @example
   * ```typescript
   * params: z.object({
   *   id: z.string().transform(val => parseInt(val, 10)),
   *   slug: z.string().min(1)
   * })
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
  params?: ZodType<any>;
  /**
   * Query string parameter validation schema specific to this method.
   * Overrides or extends the common querystring schema defined at the route level.
   *
   * @example
   * ```typescript
   * querystring: z.object({
   *   search: z.string().optional(),
   *   page: z.number().min(1).default(1),
   *   limit: z.number().min(1).max(100).default(10)
   * })
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
  querystring?: ZodType<any>;
  /**
   * Request header validation schema specific to this method.
   * Overrides or extends the common headers schema defined at the route level.
   *
   * @example
   * ```typescript
   * headers: z.object({
   *   'content-type': z.literal('application/json'),
   *   authorization: z.string().startsWith('Bearer ')
   * })
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
  headers?: ZodType<any>;
  /**
   * Request body validation schema for this method.
   * Only applicable to methods that accept a request body (POST, PUT, PATCH).
   *
   * @example
   * ```typescript
   * body: z.object({
   *   name: z.string().min(1),
   *   email: z.string().email(),
   *   age: z.number().min(0).optional()
   * })
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
  body?: ZodType<any>;
  /**
   * Response validation schemas mapped by HTTP status codes.
   *
   * @example
   * ```typescript
   * response: {
   *   200: UserSchema,
   *   201: UserSchema,
   *   400: z.object({ error: z.string() }),
   *   404: z.object({ error: z.string(), message: z.string() })
   * }
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
  response?: Record<number, ZodType<any>>;
}

// ─── Bridge Types ─────────────────────────────────────────────────────────────
// These internal types compute Hono's Input shape directly from the route schema,
// enabling typed c.req.valid() for params, query, body, and headers.

/**
 * Resolves a schema field: method-level first, route-level fallback.
 * @internal
 */
type ResolveField<S extends RouteSchema, M extends HttpMethod, F extends string> =
  S[M] extends Record<F, infer V> ? V : F extends keyof S ? S[F] : undefined;

/** Extracts Zod output type, defaults to empty object. @internal */
// biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
type ZodOutput<T> = T extends ZodType<infer O> ? O : Record<string, any>;

/**
 * Computes validation targets from a route schema for a given method.
 * Maps to Hono's internal Input shape used by c.req.valid().
 * @internal
 */
type SchemaToValidationTargets<S extends RouteSchema, M extends HttpMethod> = {
  param: ZodOutput<ResolveField<S, M, "params">>;
  query: ZodOutput<ResolveField<S, M, "querystring">>;
  // biome-ignore lint/suspicious/noExplicitAny: required for dynamic schema types
  json: S[M] extends { body: ZodType<infer B> } ? B : any;
  header: ZodOutput<ResolveField<S, M, "headers">>;
};

/**
 * Input type for Hono handlers, computed from the route schema.
 * @internal
 */
type SchemaToInput<S extends RouteSchema, M extends HttpMethod> = {
  in: SchemaToValidationTargets<S, M>;
  out: SchemaToValidationTargets<S, M>;
};

// ─── Handler Types ────────────────────────────────────────────────────────────

/**
 * Type-safe GET handler with full inference from schema.
 * Provides typed `c.req.valid()` and `c.json()` based on `schema.get`.
 *
 * @template S - The route schema type (typeof schema)
 *
 * @example
 * ```typescript
 * export const get: GetHandler<typeof schema> = async (c) => {
 *   const { id } = c.req.valid("param");
 *   return c.json({ id, title: "Todo" }, 200);
 * };
 * ```
 */
export type GetHandler<S extends RouteSchema> = Handler<BoilrEnv, string, SchemaToInput<S, "get">>;

/**
 * Type-safe POST handler with full inference from schema.
 * Provides typed `c.req.valid()` and `c.json()` based on `schema.post`.
 *
 * @template S - The route schema type (typeof schema)
 *
 * @example
 * ```typescript
 * export const post: PostHandler<typeof schema> = async (c) => {
 *   const body = c.req.valid("json");
 *   return c.json(newItem, 201);
 * };
 * ```
 */
export type PostHandler<S extends RouteSchema> = Handler<BoilrEnv, string, SchemaToInput<S, "post">>;

/**
 * Type-safe PUT handler with full inference from schema.
 *
 * @template S - The route schema type (typeof schema)
 *
 * @example
 * ```typescript
 * export const put: PutHandler<typeof schema> = async (c) => {
 *   const { id } = c.req.valid("param");
 *   const body = c.req.valid("json");
 *   return c.json(updated, 200);
 * };
 * ```
 */
export type PutHandler<S extends RouteSchema> = Handler<BoilrEnv, string, SchemaToInput<S, "put">>;

/**
 * Type-safe DELETE handler with full inference from schema.
 *
 * @template S - The route schema type (typeof schema)
 *
 * @example
 * ```typescript
 * export const del: DeleteHandler<typeof schema> = async (c) => {
 *   const { id } = c.req.valid("param");
 *   return c.body(null, 204);
 * };
 * ```
 */
export type DeleteHandler<S extends RouteSchema> = Handler<BoilrEnv, string, SchemaToInput<S, "delete">>;

/**
 * Type-safe PATCH handler with full inference from schema.
 *
 * @template S - The route schema type (typeof schema)
 */
export type PatchHandler<S extends RouteSchema> = Handler<BoilrEnv, string, SchemaToInput<S, "patch">>;

/**
 * Type-safe HEAD handler with full inference from schema.
 *
 * @template S - The route schema type (typeof schema)
 */
export type HeadHandler<S extends RouteSchema> = Handler<BoilrEnv, string, SchemaToInput<S, "head">>;

/**
 * Type-safe OPTIONS handler with full inference from schema.
 *
 * @template S - The route schema type (typeof schema)
 */
export type OptionsHandler<S extends RouteSchema> = Handler<BoilrEnv, string, SchemaToInput<S, "options">>;

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Utility function for defining route schemas with full TypeScript inference.
 * Provides better IDE support and type checking for your route schemas.
 *
 * @template T - The route schema type
 * @param schema - The route schema configuration
 * @returns The same schema with enhanced type information
 *
 * @example
 * ```typescript
 * export const schema = defineSchema({
 *   get: {
 *     tags: ["Users"],
 *     params: z.object({
 *       id: z.string().transform(val => parseInt(val, 10))
 *     }),
 *     response: {
 *       200: UserSchema,
 *       404: ErrorSchema
 *     }
 *   },
 *   post: {
 *     tags: ["Users"],
 *     body: CreateUserSchema,
 *     response: {
 *       201: UserSchema
 *     }
 *   }
 * });
 * ```
 */
export const defineSchema = <T extends RouteSchema>(schema: T): T => {
  return schema;
};

/**
 * Type for dynamic route path segments.
 * Used internally for handling dynamic routing patterns.
 *
 * @example
 * ```typescript
 * // For routes like /users/[id] or /posts/[...slug]
 * const segments: PathSegments = {
 *   id: "123",
 *   slug: ["category", "subcategory", "post-title"]
 * };
 * ```
 */
export interface PathSegments {
  [key: string]: string | string[];
}

/**
 * Helper type for catch-all route parameters.
 * Used for routes that capture multiple path segments like `/posts/[...slug]`.
 *
 * @template T - The type of individual path segments
 *
 * @example
 * ```typescript
 * // Route: /files/[...path]
 * const filePath: CatchAllParam<string> = ["folder", "subfolder", "file.txt"];
 * // or
 * const filePath: CatchAllParam<string> = "single-file.txt";
 * ```
 */
export type CatchAllParam<T extends string = string> = T[] | T;

/**
 * Helper function for creating Zod schemas that handle catch-all route parameters.
 * Creates a union type that accepts either an array or a single value.
 *
 * @template T - The Zod type for individual elements
 * @param innerType - The Zod schema for individual path segments
 * @returns A Zod schema that accepts either an array of the inner type or a single value
 *
 * @example
 * ```typescript
 * // For a route like /files/[...path]
 * const schema = defineSchema({
 *   get: {
 *     params: z.object({
 *       path: catchAllSchema(z.string())
 *     })
 *   }
 * });
 *
 * // This will accept both:
 * // /files/document.pdf (path = "document.pdf")
 * // /files/folder/subfolder/document.pdf (path = ["folder", "subfolder", "document.pdf"])
 * ```
 */
export const catchAllSchema = <T extends z.ZodTypeAny>(innerType: T) => {
  return z.union([z.array(innerType), innerType]);
};
