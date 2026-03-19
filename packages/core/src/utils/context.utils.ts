import type { Context } from "hono";
import type { BoilrEnv } from "../types/env.types.js";

/**
 * Legacy request shape for migration from (request, reply) to (c) handlers.
 * Provides the same API as the old TypedRequest for gradual migration.
 *
 * @deprecated Use c.req.valid() directly instead.
 */
export interface LegacyRequest {
  /** Route parameters (from c.req.valid("param") or c.req.param()) */
  params: Record<string, unknown>;
  /** Query string parameters (from c.req.valid("query") or c.req.query()) */
  query: Record<string, unknown>;
  /** Request headers */
  headers: Record<string, string>;
  /** Request body (from c.req.valid("json")) */
  body: unknown;
  /** Environment bindings */
  env: Record<string, unknown>;
  /** Raw Web API Request object */
  raw: Request;
  /** Auth context set by middleware */
  ctx: unknown;
}

/**
 * Legacy reply shape for migration from (request, reply) to (c) handlers.
 * Provides the same chainable API as the old TypedReply.
 *
 * @deprecated Use c.json() and c.body() directly instead.
 */
export interface LegacyReply {
  /** Set the HTTP status code */
  code: (status: number) => LegacyReply;
  /** Set a response header */
  header: (name: string, value: string) => LegacyReply;
  /** Send a JSON response */
  send: (data: unknown) => Response;
}

/**
 * Migration helper: extracts familiar { request, reply } objects from a Hono context.
 * Use this as a bridge when migrating handlers from (request, reply) to (c).
 *
 * @param c - The Hono context object
 * @returns An object with `request` and `reply` matching the old handler API
 *
 * @deprecated This is a temporary migration aid. Migrate to c.req.valid() and c.json() directly.
 *
 * @example
 * ```typescript
 * // Before (old API):
 * export const get = async (request, reply) => {
 *   const { id } = request.params;
 *   return reply.code(200).send({ id });
 * };
 *
 * // Step 1 — Migration with fromContext:
 * export const get: GetHandler<typeof schema> = async (c) => {
 *   const { request, reply } = fromContext(c);
 *   const { id } = request.params;
 *   return reply.code(200).send({ id });
 * };
 *
 * // Step 2 — Final (native API):
 * export const get: GetHandler<typeof schema> = async (c) => {
 *   const { id } = c.req.valid("param");
 *   return c.json({ id }, 200);
 * };
 * ```
 */
export const fromContext = (c: Context<BoilrEnv>): { request: LegacyRequest; reply: LegacyReply } => {
  // Extract params: prefer validated, fallback to raw
  let params: Record<string, unknown>;
  try {
    params = c.req.valid("param" as never);
  } catch {
    params = c.req.param() as Record<string, unknown>;
  }

  // Extract query: prefer validated, fallback to raw
  let query: Record<string, unknown>;
  try {
    query = c.req.valid("query" as never);
  } catch {
    query = c.req.query() as Record<string, unknown>;
  }

  // Extract headers: prefer validated, fallback to raw
  let headers: Record<string, string>;
  try {
    headers = c.req.valid("header" as never);
  } catch {
    headers = Object.fromEntries([...c.req.raw.headers.entries()]);
  }

  // Build request with lazy body — only parsed when accessed
  const request: LegacyRequest = {
    params,
    query,
    headers,
    body: undefined,
    env: (c.env ?? {}) as Record<string, unknown>,
    raw: c.req.raw,
    ctx: c.get("ctx"),
  };

  // Lazy body: avoid consuming the stream unless the user reads request.body
  let bodyResolved = false;
  let bodyCache: unknown;
  Object.defineProperty(request, "body", {
    get: () => {
      if (!bodyResolved) {
        bodyResolved = true;
        try {
          bodyCache = c.req.valid("json" as never);
        } catch {
          // No validated body available — will be undefined.
          // For async body parsing, users should use c.req.json() directly.
          bodyCache = undefined;
        }
      }
      return bodyCache;
    },
    enumerable: true,
    configurable: true,
  });

  // Build chainable reply
  let statusCode = 200;

  const reply: LegacyReply = {
    code: (status: number) => {
      statusCode = status;
      return reply;
    },
    header: (name: string, value: string) => {
      c.header(name, value);
      return reply;
    },
    send: (data: unknown) => {
      return c.json(data, statusCode as 200);
    },
  };

  return { request, reply };
};
