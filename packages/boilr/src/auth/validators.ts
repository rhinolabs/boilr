import type { FastifyRequest } from "fastify";
import { UnauthorizedException } from "../exceptions/index.js";
import type { AuthMethod } from "./types.js";

export async function validateAuthMethod(request: FastifyRequest, authMethod: AuthMethod): Promise<any> {
  try {
    const result = await authMethod.validator(request);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    throw new UnauthorizedException(message);
  }
}

export async function validateAuthMethods(
  request: FastifyRequest,
  authMethods: AuthMethod[],
  requiredAuthNames: string[],
): Promise<any> {
  const errors: string[] = [];

  for (const authName of requiredAuthNames) {
    const authMethod = authMethods.find((method) => method.name === authName);

    if (!authMethod) {
      errors.push(`Auth method '${authName}' not found`);
      continue;
    }

    try {
      const result = await validateAuthMethod(request, authMethod);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      errors.push(`${authName}: ${message}`);
    }
  }

  throw new UnauthorizedException(`Authentication failed: ${errors.join(", ")}`);
}
