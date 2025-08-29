import type { FastifyReply, FastifyRequest } from "fastify";
import { type ZodType, z } from "zod";
import type { BoilrAuthContext } from "./auth.types.js";

/**
 * Supported HTTP methods in Boilr routes
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
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
 * This interface defines validation schemas and Swagger tags for individual HTTP methods.
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
   * Tags help categorize your endpoints in the Swagger UI for better organization.
   *
   * @example
   * ```typescript
   * tags: ["Users"] // Single tag
   * tags: ["Users", "Admin"] // Multiple tags
   * tags: ["Authentication", "Public"] // Different categories
   * ```
   */
  tags?: string[];

  /**
   * HTTP status codes for which to include default error response schemas for this method.
   * Overrides global configuration when specified. Use false or empty array to disable completely.
   *
   * @example
   * ```typescript
   * defaultErrorStatusCodes: [] // Disable all default error schemas for this method
   * defaultErrorStatusCodes: false // Disable all default error schemas for this method
   * defaultErrorStatusCodes: [401, 500] // Only include 401 and 500 schemas
   * defaultErrorStatusCodes: [400, 401, 403, 404, 500] // Include common error schemas
   * ```
   */
  defaultErrorStatusCodes?: number[] | false;

  /**
   * Route parameter validation schema specific to this method.
   * This overrides or extends the common params schema defined at the route level.
   *
   * @example
   * ```typescript
   * params: z.object({
   *   id: z.string().transform(val => parseInt(val, 10)),
   *   slug: z.string().min(1)
   * })
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  params?: ZodType<any>;

  /**
   * Query string parameter validation schema specific to this method.
   * This overrides or extends the common querystring schema defined at the route level.
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
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  querystring?: ZodType<any>;

  /**
   * Request header validation schema specific to this method.
   * This overrides or extends the common headers schema defined at the route level.
   *
   * @example
   * ```typescript
   * headers: z.object({
   *   'content-type': z.literal('application/json'),
   *   authorization: z.string().startsWith('Bearer ')
   * })
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  body?: ZodType<any>;

  /**
   * Response validation schemas mapped by HTTP status codes.
   * This defines the structure of responses for different status codes.
   *
   * @example
   * ```typescript
   * response: {
   *   200: UserSchema,
   *   201: UserSchema,
   *   400: z.object({ error: z.string() }),
   *   404: z.object({ error: z.string(), message: z.string() }),
   *   500: z.object({ error: z.string() })
   * }
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  response?: Record<number, ZodType<any>>;
}

// Extract parameter types with inference
type ExtractParams<S extends RouteSchema, M extends HttpMethod> = S["params"] extends ZodType<infer P>
  ? S[M] extends { params: ZodType<infer MP> }
    ? P & MP
    : P
  : S[M] extends { params: ZodType<infer MP> }
    ? MP
    : unknown;

// Extract query types with inference
type ExtractQuery<S extends RouteSchema, M extends HttpMethod> = S["querystring"] extends ZodType<infer Q>
  ? S[M] extends { querystring: ZodType<infer MQ> }
    ? Q & MQ
    : Q
  : S[M] extends { querystring: ZodType<infer MQ> }
    ? MQ
    : unknown;

// Extract header types with inference
type ExtractHeaders<S extends RouteSchema, M extends HttpMethod> = S["headers"] extends ZodType<infer H>
  ? S[M] extends { headers: ZodType<infer MH> }
    ? H & MH
    : H
  : S[M] extends { headers: ZodType<infer MH> }
    ? MH
    : unknown;

// Extract body types with inference
type ExtractBody<S extends RouteSchema, M extends HttpMethod> = S[M] extends { body: ZodType<infer B> } ? B : unknown;

// Extract response types with status code inference
type ExtractResponse<S extends RouteSchema, M extends HttpMethod, Status extends number = 200> = S[M] extends {
  response: Record<Status, ZodType<infer R>>;
}
  ? R
  : unknown;

/**
 * Typed request object that provides type-safe access to route parameters, query strings, headers, and body.
 * The types are automatically inferred from your route schema definition.
 *
 * @template S - The route schema type
 * @template M - The HTTP method type
 *
 * @example
 * ```typescript
 * export const get: GetHandler<typeof schema> = async (request, reply) => {
 *   const { id } = request.params; // Typed based on schema.get.params
 *   const { page } = request.query; // Typed based on schema.get.querystring
 *   const { authorization } = request.headers; // Typed based on schema.get.headers
 *   // ...
 * };
 * ```
 */
export type TypedRequest<S extends RouteSchema, M extends HttpMethod> = FastifyRequest<{
  Params: ExtractParams<S, M>;
  Querystring: ExtractQuery<S, M>;
  Headers: ExtractHeaders<S, M>;
  Body: ExtractBody<S, M>;
}> &
  (S[M] extends { auth: false } ? never : { ctx: BoilrAuthContext });

/**
 * Generic route handler type with automatic type inference from schema.
 * Provides type-safe request and response handling.
 *
 * @template S - The route schema type
 * @template M - The HTTP method type
 * @template Status - The expected response status code (defaults based on method)
 *
 * @example
 * ```typescript
 * const handler: RouteHandler<typeof schema, "get"> = async (request, reply) => {
 *   // request and response are fully typed
 *   return { message: "Hello" }; // Must match schema.get.response[200]
 * };
 * ```
 */
export type RouteHandler<
  S extends RouteSchema,
  M extends HttpMethod,
  Status extends number = M extends "post" ? 201 : 200,
> = (
  request: TypedRequest<S, M>,
  reply: FastifyReply,
) => Promise<ExtractResponse<S, M, Status>> | ExtractResponse<S, M, Status>;

/**
 * Type-safe GET request handler.
 * Automatically infers types from the schema's `get` method configuration.
 *
 * @template S - The route schema type
 *
 * @example
 * ```typescript
 * export const get: GetHandler<typeof schema> = async (request, reply) => {
 *   // Fully typed request based on schema.get
 *   const { id } = request.params;
 *   return await getUserById(id);
 * };
 * ```
 */
export type GetHandler<S extends RouteSchema> = RouteHandler<S, "get">;

/**
 * Type-safe POST request handler.
 * Automatically infers types from the schema's `post` method configuration.
 * Defaults to 201 status code for successful creation.
 *
 * @template S - The route schema type
 *
 * @example
 * ```typescript
 * export const post: PostHandler<typeof schema> = async (request, reply) => {
 *   // Fully typed request based on schema.post
 *   const userData = request.body;
 *   const newUser = await createUser(userData);
 *   reply.code(201);
 *   return newUser;
 * };
 * ```
 */
export type PostHandler<S extends RouteSchema> = RouteHandler<S, "post", 201>;

/**
 * Type-safe PUT request handler.
 * Automatically infers types from the schema's `put` method configuration.
 *
 * @template S - The route schema type
 *
 * @example
 * ```typescript
 * export const put: PutHandler<typeof schema> = async (request, reply) => {
 *   const { id } = request.params;
 *   const updates = request.body;
 *   return await updateUser(id, updates);
 * };
 * ```
 */
export type PutHandler<S extends RouteSchema> = RouteHandler<S, "put">;

/**
 * Type-safe DELETE request handler.
 * Automatically infers types from the schema's `delete` method configuration.
 *
 * @template S - The route schema type
 *
 * @example
 * ```typescript
 * export const del: DeleteHandler<typeof schema> = async (request, reply) => {
 *   const { id } = request.params;
 *   await deleteUser(id);
 *   reply.code(204);
 *   return null;
 * };
 * ```
 */
export type DeleteHandler<S extends RouteSchema> = RouteHandler<S, "delete">;

/**
 * Type-safe PATCH request handler.
 * Automatically infers types from the schema's `patch` method configuration.
 *
 * @template S - The route schema type
 *
 * @example
 * ```typescript
 * export const patch: PatchHandler<typeof schema> = async (request, reply) => {
 *   const { id } = request.params;
 *   const partialUpdates = request.body;
 *   return await partialUpdateUser(id, partialUpdates);
 * };
 * ```
 */
export type PatchHandler<S extends RouteSchema> = RouteHandler<S, "patch">;

/**
 * Type-safe HEAD request handler.
 * Automatically infers types from the schema's `head` method configuration.
 *
 * @template S - The route schema type
 */
export type HeadHandler<S extends RouteSchema> = RouteHandler<S, "head">;

/**
 * Type-safe OPTIONS request handler.
 * Automatically infers types from the schema's `options` method configuration.
 *
 * @template S - The route schema type
 */
export type OptionsHandler<S extends RouteSchema> = RouteHandler<S, "options">;

/**
 * Utility function for defining route schemas with full TypeScript inference.
 * This function provides better IDE support and type checking for your route schemas.
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
export function defineSchema<T extends RouteSchema>(schema: T): T {
  return schema;
}

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
 * This function creates a union type that accepts either an array or a single value.
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
export function catchAllSchema<T extends z.ZodTypeAny>(innerType: T) {
  return z.union([z.array(innerType), innerType]);
}
