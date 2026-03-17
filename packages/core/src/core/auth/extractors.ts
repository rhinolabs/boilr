import type { AuthLocation, BasicCredentials, BoilrRequest } from "../../types/auth.types.js";

export function extractBearerToken(request: BoilrRequest, scheme = "Bearer"): string | undefined {
  const authorization = request.headers.authorization;

  if (!authorization || typeof authorization !== "string") {
    return;
  }

  const prefix = `${scheme} `;

  if (!authorization.startsWith(prefix)) {
    return;
  }

  return authorization.slice(prefix.length);
}

export function extractApiKey(request: BoilrRequest, location: AuthLocation, key: string): string | undefined {
  switch (location) {
    case "header":
      return (request.headers[key.toLowerCase()] as string) || undefined;
    case "query":
      return request.query?.[key] || undefined;
    case "cookie":
      return request.cookies?.[key] || undefined;
    default:
      return;
  }
}

export function extractBasicCredentials(request: BoilrRequest): BasicCredentials | undefined {
  const authorization = request.headers.authorization;

  if (!authorization || typeof authorization !== "string" || !authorization.startsWith("Basic ")) {
    return;
  }

  try {
    const encoded = authorization.slice("Basic ".length);
    const decoded = atob(encoded);
    const [username, password] = decoded.split(":", 2);

    if (!username || password === undefined) {
      return;
    }

    return { username, password };
  } catch {
    return;
  }
}
