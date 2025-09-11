import type { z } from "zod";
import type { LightMyRequestResponse } from "fastify";

export function matchesSchema<T extends z.ZodSchema>(
  response: LightMyRequestResponse,
  schema: T
): z.infer<T> {
  try {
    const data = JSON.parse(response.body);
    return schema.parse(data);
  } catch (error) {
    throw new Error(
      `Response does not match schema. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Response: ${response.body}`
    );
  }
}

export function hasStatusCode(response: LightMyRequestResponse, expectedCode: number): boolean {
  return response.statusCode === expectedCode;
}

export function hasHeader(response: LightMyRequestResponse, headerName: string, expectedValue?: string): boolean {
  const headerValue = response.headers[headerName.toLowerCase()];
  if (expectedValue === undefined) {
    return headerValue !== undefined;
  }
  return headerValue === expectedValue;
}

export function isJsonResponse(response: LightMyRequestResponse): boolean {
  const contentType = response.headers['content-type'];
  return typeof contentType === 'string' && contentType.includes('application/json');
}

export function parseJsonResponse<T = any>(response: LightMyRequestResponse): T {
  if (!isJsonResponse(response)) {
    throw new Error(`Response is not JSON. Content-Type: ${response.headers['content-type']}`);
  }
  
  try {
    return JSON.parse(response.body);
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${response.body}`);
  }
}