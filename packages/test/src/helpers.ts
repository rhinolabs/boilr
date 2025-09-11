import type {BoilrInstance} from "@rhinolabs/boilr";
import type {InjectOptions, LightMyRequestResponse} from "fastify";
import type {AuthTestOptions, MockRequestOptions} from "./types.js";

export function createMockRequest(options: MockRequestOptions = {}): InjectOptions {
  const {
    method = 'GET',
    url = '/',
    headers = {},
    query,
    payload,
    cookies
  } = options;

  const injectOptions: InjectOptions = {
    method: method as any,
    url,
    headers: { ...headers }
  };

  if (query) {
    injectOptions.query = query as Record<string, string | string[]>;
  }

  if (payload) {
    injectOptions.payload = payload;
    if (!headers['content-type']) {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      injectOptions.headers!['content-type'] = 'application/json';
    }
  }

  if (cookies) {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    injectOptions.headers!.cookie = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  }

  return injectOptions;
}

export function withAuth(request: InjectOptions, auth: AuthTestOptions): InjectOptions {
  const authRequest = { ...request };

  switch (auth.type) {
    case 'bearer':
      authRequest.headers = {
        ...authRequest.headers,
        authorization: `Bearer ${auth.value}`
      };
      break;

    case 'basic':
      authRequest.headers = {
        ...authRequest.headers,
        authorization: `Basic ${auth.value}`
      };
      break;

    case 'apiKey':
      const location = auth.location || 'header';
      if (location === 'header') {
        authRequest.headers = {
          ...authRequest.headers,
          'x-api-key': auth.value
        };
      } else if (location === 'query') {
        authRequest.query = {
          ...(authRequest.query as Record<string, string | string[]> || {}),
          apiKey: auth.value
        };
      } else if (location === 'cookie') {
        const existingCookie = authRequest.headers?.cookie || '';
        const newCookie = existingCookie ? `${existingCookie}; apiKey=${auth.value}` : `apiKey=${auth.value}`;
        authRequest.headers = {
          ...authRequest.headers,
          cookie: newCookie
        };
      }
      break;

    case 'cookie':
      const existingCookie = authRequest.headers?.cookie || '';
      const newCookie = existingCookie ? `${existingCookie}; session=${auth.value}` : `session=${auth.value}`;
      authRequest.headers = {
        ...authRequest.headers,
        cookie: newCookie
      };
      break;
  }

  return authRequest;
}

export async function expectStatusCode(app: BoilrInstance, request: InjectOptions, expectedCode: number): Promise<LightMyRequestResponse> {
  const response = await app.inject(request);
  if (response.statusCode !== expectedCode) {
    throw new Error(
      `Expected status code ${expectedCode}, got ${response.statusCode}. Response: ${response.body}`
    );
  }
  return response;
}

export async function expectValidationError(app: BoilrInstance, request: InjectOptions, fieldName?: string): Promise<LightMyRequestResponse> {
  const response = await app.inject(request);
  if (response.statusCode !== 400) {
    throw new Error(
      `Expected validation error (400), got ${response.statusCode}. Response: ${response.body}`
    );
  }

  if (fieldName) {
    const body = JSON.parse(response.body);
    const hasFieldError = body.details?.some((detail: any) =>
      detail.path?.includes(fieldName)
    );

    if (!hasFieldError) {
      throw new Error(
        `Expected validation error for field "${fieldName}", but it was not found in: ${response.body}`
      );
    }
  }

  return response;
}
