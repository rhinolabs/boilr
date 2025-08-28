import type { FastifyRequest } from "fastify";
import type { AuthLocation, BasicCredentials } from "./types.js";

export function extractBearerToken(request: FastifyRequest, scheme = "Bearer"): string | null {
  const authorization = request.headers.authorization;

  if (!authorization) {
    return null;
  }

  const prefix = `${scheme} `;

  if (!authorization.startsWith(prefix)) {
    return null;
  }

  return authorization.slice(prefix.length);
}

export function extractApiKey(request: FastifyRequest, location: AuthLocation, key: string): string | null {
  switch (location) {
    case "header":
      return (request.headers[key] as string) || null;
    case "query":
      return (request.query as Record<string, any>)?.[key] || null;
    case "cookie":
      return request.cookies?.[key] || null;
    default:
      return null;
  }
}

export function extractBasicCredentials(request: FastifyRequest): BasicCredentials | null {
  const authorization = request.headers.authorization;

  if (!authorization || !authorization.startsWith("Basic ")) {
    return null;
  }

  try {
    const encoded = authorization.slice("Basic ".length);
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const [username, password] = decoded.split(":", 2);

    if (!username || password === undefined) {
      return null;
    }

    return { username, password };
  } catch {
    return null;
  }
}
