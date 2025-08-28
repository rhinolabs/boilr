import type { FastifyRequest } from "fastify";
import { UnauthorizedException } from "../../exceptions/index.js";
import type { AuthMethod, BoilrAuthContext } from "../../types/auth.types.js";

export async function validateAuthMethod(request: FastifyRequest, authMethod: AuthMethod): Promise<BoilrAuthContext> {
  try {
    return await authMethod.validator(request);
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
