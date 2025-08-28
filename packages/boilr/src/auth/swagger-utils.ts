import type { OpenAPIV3 } from "openapi-types";
import type { AuthConfig, AuthMethod } from "./types.js";

export function generateSecuritySchemes(authConfig?: AuthConfig): OpenAPIV3.ComponentsObject["securitySchemes"] {
  if (!authConfig?.methods) {
    return {};
  }

  const securitySchemes: OpenAPIV3.ComponentsObject["securitySchemes"] = {};

  for (const method of authConfig.methods) {
    const scheme = mapAuthMethodToSecurityScheme(method);
    if (scheme) {
      securitySchemes[method.name] = scheme;
    }
  }

  return securitySchemes;
}

function mapAuthMethodToSecurityScheme(method: AuthMethod): OpenAPIV3.SecuritySchemeObject | null {
  switch (method.type) {
    case "bearer":
      return {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      };

    case "apiKey": {
      const location = method.options?.location || "header";
      const keyName = method.options?.key || "api-key";

      return {
        type: "apiKey",
        name: keyName,
        in: location === "header" ? "header" : location === "query" ? "query" : "cookie",
      };
    }

    case "basic":
      return {
        type: "http",
        scheme: "basic",
      };

    case "cookie": {
      const cookieKey = method.options?.key || "sessionId";
      return {
        type: "apiKey",
        name: cookieKey,
        in: "cookie",
      };
    }

    default:
      return null;
  }
}

export function generateSecurityRequirement(authNames: string[]): OpenAPIV3.SecurityRequirementObject {
  const security: OpenAPIV3.SecurityRequirementObject = {};

  for (const name of authNames) {
    security[name] = [];
  }

  return security;
}
