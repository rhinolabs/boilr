import type { FastifyRequest } from "fastify";
import type { AuthLocation, BasicCredentials } from "../../types/auth.types.js";

export function extractBearerToken(request: FastifyRequest, scheme = "Bearer"): string | undefined {
  const authorization = request.headers.authorization;

  if (!authorization) {
    return;
  }

  const prefix = `${scheme} `;

  if (!authorization.startsWith(prefix)) {
    return;
  }

  return authorization.slice(prefix.length);
}

export function extractApiKey(request: FastifyRequest, location: AuthLocation, key: string): string | undefined {
  switch (location) {
    case "header":
      return (request.headers[key] as string) || undefined;
    case "query":
      return (request.query as Record<string, string>)?.[key] || undefined;
    case "cookie":
      return request.cookies?.[key] || undefined;
    default:
      return;
  }
}

export function extractBasicCredentials(request: FastifyRequest): BasicCredentials | undefined {
  const authorization = request.headers.authorization;

  if (!authorization || !authorization.startsWith("Basic ")) {
    return;
  }

  try {
    const encoded = authorization.slice("Basic ".length);
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const [username, password] = decoded.split(":", 2);

    if (!username || password === undefined) {
      return;
    }

    return { username, password };
  } catch {
    return;
  }
}
