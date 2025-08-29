import type { FastifyRequest } from "fastify";
import { UnauthorizedException } from "../../exceptions/index.js";
import type { AuthMethod, BoilrAuthContext } from "../../types/auth.types.js";
import { extractApiKey, extractBasicCredentials, extractBearerToken } from "./extractors.js";

export async function validateAuthMethod(request: FastifyRequest, authMethod: AuthMethod): Promise<BoilrAuthContext> {
  try {
    switch (authMethod.type) {
      case "bearer": {
        const token = extractBearerToken(request);
        return await authMethod.validator(request, token);
      }

      case "apiKey": {
        const apiKey = extractApiKey(request, authMethod.options?.location || "header", authMethod.options?.key || "");
        return await authMethod.validator(request, apiKey);
      }

      case "cookie": {
        const cookieValue = extractApiKey(
          request,
          authMethod.options?.location || "cookie",
          authMethod.options?.key || "",
        );
        return await authMethod.validator(request, cookieValue);
      }

      case "basic": {
        const credentials = extractBasicCredentials(request);
        return await authMethod.validator(request, credentials?.username, credentials?.password);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    throw new UnauthorizedException(message);
  }
}

export async function validateAuthMethods(
  request: FastifyRequest,
  authMethods: AuthMethod[],
  requiredAuthNames: string[],
): Promise<BoilrAuthContext> {
  const errors: string[] = [];

  for (const authName of requiredAuthNames) {
    const authMethod = authMethods.find((method) => method.name === authName);

    if (!authMethod) {
      errors.push(`Auth method '${authName}' not found`);
      continue;
    }

    try {
      return await validateAuthMethod(request, authMethod);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      errors.push(`${authName}: ${message}`);
    }
  }

  throw new UnauthorizedException(`Authentication failed: ${errors.join(", ")}`);
}
