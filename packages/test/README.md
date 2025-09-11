# @rhinolabs/boilr-test

Testing utilities for Boilr framework applications following convention-over-configuration principles.

## Installation

```bash
npm install --save-dev @rhinolabs/boilr-test vitest
```

## Quick Start

```typescript
import { test, expect } from 'vitest'
import { createTestApp, createMockRequest, matchesSchema } from '@rhinolabs/boilr-test'
import { schema } from './todos/index.js'

test('GET /todos returns todos list', async () => {
  const { app, cleanup } = await createTestApp()
  
  const response = await app.inject(createMockRequest({
    method: 'GET',
    url: '/todos'
  }))
  
  expect(response.statusCode).toBe(200)
  const data = matchesSchema(response, schema.get.response[200])
  expect(Array.isArray(data)).toBe(true)
  
  await cleanup()
})
```

## API Reference

### createTestApp(config?)

Creates a Boilr application instance optimized for testing.

```typescript
const { app, cleanup } = await createTestApp({
  silent: true, // Disable logging
  plugins: {
    swagger: false, // Disable Swagger in tests
    monitor: false  // Disable monitoring
  },
  database: {
    setup: async () => {
      // Database setup logic
    },
    teardown: async () => {
      // Database cleanup logic
    }
  }
})
```

### withTestApp(config?, callback)

Automatically handles app lifecycle for a single test.

```typescript
await withTestApp({ silent: true }, async (app) => {
  const response = await app.inject({ url: '/health' })
  expect(response.statusCode).toBe(200)
})
```

### Test Helpers

#### createMockRequest(options)

Creates a properly formatted request for `app.inject()`.

```typescript
const request = createMockRequest({
  method: 'POST',
  url: '/todos',
  payload: { title: 'Test todo' },
  headers: { 'custom-header': 'value' },
  query: { limit: 10 },
  cookies: { session: 'abc123' }
})
```

#### withAuth(request, authOptions)

Adds authentication to a request.

```typescript
const request = createMockRequest({ url: '/protected' })
const authedRequest = withAuth(request, {
  type: 'bearer',
  value: 'jwt-token'
})

// Or API key
const apiKeyRequest = withAuth(request, {
  type: 'apiKey',
  value: 'my-api-key',
  location: 'header' // or 'query', 'cookie'
})
```

### Response Matchers

#### matchesSchema(response, zodSchema)

Validates and parses response against a Zod schema.

```typescript
const data = matchesSchema(response, z.object({
  id: z.number(),
  title: z.string()
}))
```

#### Other matchers

```typescript
import { hasStatusCode, hasHeader, isJsonResponse, parseJsonResponse } from '@rhinolabs/boilr-test'

expect(hasStatusCode(response, 200)).toBe(true)
expect(hasHeader(response, 'content-type', 'application/json')).toBe(true)
expect(isJsonResponse(response)).toBe(true)

const data = parseJsonResponse(response)
```

## Convention-Based Testing

Place test files alongside your routes:

```
src/routes/
  todos/
    index.ts      # Route implementation
    index.test.ts # Route tests
    [id].ts
    [id].test.ts
```

## License

MIT