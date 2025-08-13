# @rhinolabs/boilr

A convention-based Fastify framework with batteries included. Boilr brings Next.js-inspired simplicity and TypeScript type safety to Fastify API development.

<p align="center">
  <img src="https://img.shields.io/npm/v/@rhinolabs/boilr" alt="npm version">
  <img src="https://img.shields.io/npm/l/@rhinolabs/boilr" alt="license">
  <img src="https://img.shields.io/github/stars/rhinolabs/boilr" alt="github stars">
</p>

## Features

- **🗂️ File-based routing** - Next.js style API routes with dynamic parameters and catch-all support
- **🛡️ Type-safe validation** - First-class Zod integration with TypeScript type inference and automatic request/response validation
- **🚨 Error handling** - Comprehensive HTTP exception classes with structured responses and automatic validation error conversion
- **📚 Auto-generated API docs** - Swagger/OpenAPI documentation automatically generated from your Zod schemas
- **🔒 Security & Performance** - Pre-configured CORS, Helmet security headers, and rate limiting
- **🧩 Plugin system** - Built on Fastify's powerful plugin architecture with easy extensibility
- **🛠️ Developer experience** - CLI tools, hot-reload development server, and comprehensive TypeScript support

## Installation

```bash
# Create a new project using the CLI (recommended)
npm install -g @rhinolabs/boilr-cli
boilr new my-api
cd my-api
npm install
npm run dev

# Or add to an existing project
npm install @rhinolabs/boilr
```

## Quick Start

```typescript
// server.ts - Your entry point
import { createApp } from '@rhinolabs/boilr';

// Create the application with configuration
const app = createApp({
  server: { port: 3000 },
  routes: { dir: './routes' },
  plugins: {
    swagger: {
      info: {
        title: 'My API',
        version: '1.0.0'
      }
    }
  }
});

// Start the server
app.start();
```

```typescript
// routes/hello.ts - A simple route
import { z } from 'zod';
import { defineSchema, type GetHandler } from '@rhinolabs/boilr';

export const schema = defineSchema({
  get: {
    querystring: z.object({
      name: z.string().optional()
    }),
    response: {
      200: z.object({
        message: z.string()
      })
    }
  }
});

export const get: GetHandler<typeof schema> = async (request, reply) => {
  const { name = 'world' } = request.query;
  return { message: `Hello, ${name}!` };
};
```

## File-Based Routing

Boilr automatically maps your directory structure to API routes following Next.js conventions:

```
routes/
├── index.ts                  → GET /
├── products/
│   ├── index.ts              → GET/POST /products
│   ├── [id].ts               → GET/PUT/DELETE /products/:id
│   └── [id]/reviews.ts       → GET /products/:id/reviews
├── (admin)/                  → (admin) won't affect URL paths
│   └── settings.ts           → GET /settings
└── [...catch-all].ts         → Catch remaining routes
```

## Type-Safe API Handlers

Define your routes with full type safety using Zod schemas:

```typescript
// routes/users/[id].ts
import { z } from 'zod';
import { defineSchema, GetHandler, PutHandler } from '@rhinolabs/boilr';

export const schema = defineSchema({
  get: {
    params: z.object({
      id: z.string().transform(val => parseInt(val, 10))
    }),
    response: {
      200: z.object({
        id: z.number(),
        name: z.string()
      })
    }
  },
  put: {
    params: z.object({
      id: z.string().transform(val => parseInt(val, 10))
    }),
    body: z.object({
      name: z.string().min(1)
    }),
    response: {
      200: z.object({
        id: z.number(),
        name: z.string(),
        updated: z.boolean()
      })
    }
  }
});

// Type-safe GET handler (id is correctly typed as number)
export const get: GetHandler<typeof schema> = async (request, reply) => {
  const { id } = request.params;
  return { id, name: `User ${id}` };
};

// Type-safe PUT handler (with typed body and params)
export const put: PutHandler<typeof schema> = async (request, reply) => {
  const { id } = request.params;
  const { name } = request.body;
  
  return { id, name, updated: true };
};
```

## HTTP Methods Support

Define handlers for different HTTP methods by exporting named functions:

```typescript
export async function get(request, reply) { ... }    // GET
export async function post(request, reply) { ... }   // POST
export async function put(request, reply) { ... }    // PUT
export async function patch(request, reply) { ... }  // PATCH
export async function del(request, reply) { ... }    // DELETE
```

## Configuration

Customize your application with a flexible configuration system:

```typescript
const app = createApp({
  server: {
    port: 8080,
    host: '0.0.0.0',
    logger: true
  },
  routes: {
    dir: './api',
    prefix: '/api/v1'
  },
  plugins: {
    helmet: true,
    rateLimit: {
      max: 100,
      timeWindow: '1 minute'
    },
    cors: true,
    swagger: {
      info: {
        title: 'My API',
        description: 'API documentation',
        version: '1.0.0'
      }
    }
  }
});
```

## Error Handling

Boilr provides comprehensive error handling with built-in HTTP exception classes and automatic error formatting:

### Exception Classes

```typescript
import { NotFoundException } from '@rhinolabs/boilr';

throw new NotFoundException('User not found');
```

**Available Exception Classes:**

**Client Errors (4xx):**
- `BadRequestException` (400) - Invalid request format or parameters
- `UnauthorizedException` (401) - Authentication required or invalid
- `ForbiddenException` (403) - Insufficient permissions
- `NotFoundException` (404) - Resource not found
- `MethodNotAllowedException` (405) - HTTP method not supported
- `NotAcceptableException` (406) - Requested format not acceptable
- `RequestTimeoutException` (408) - Request took too long
- `ConflictException` (409) - Resource conflict or duplicate
- `GoneException` (410) - Resource no longer available
- `PreconditionFailedException` (412) - Precondition not met
- `PayloadTooLargeException` (413) - Request payload too large
- `UnsupportedMediaTypeException` (415) - Media type not supported
- `ImATeapotException` (418) - I'm a teapot (RFC 2324)
- `UnprocessableEntityException` (422) - Validation failed
- `ValidationException` (422) - Validation failed with detailed errors

**Server Errors (5xx):**
- `InternalServerErrorException` (500) - Internal server error
- `NotImplementedException` (501) - Feature not implemented
- `BadGatewayException` (502) - Bad gateway response
- `ServiceUnavailableException` (503) - Service temporarily unavailable
- `GatewayTimeoutException` (504) - Gateway timeout
- `HttpVersionNotSupportedException` (505) - HTTP version not supported

### Custom Exception Options

```typescript
throw new NotFoundException('User not found', {
  name: 'USER_NOT_FOUND',           // Custom error code
  details: { userId: id },          // Additional context
  cause: originalError              // Underlying error
});
```

### Validation Errors

```typescript
import { ValidationException } from '@rhinolabs/boilr';

// Manual validation errors
throw new ValidationException('Validation failed', [
  { field: 'email', message: 'Invalid email format', value: 'invalid-email' },
  { field: 'age', message: 'Must be a positive number', value: -5 }
]);

// Zod validation errors are automatically converted
const result = userSchema.parse(invalidData); // Throws ZodError -> becomes ValidationException
```

### Error Response Format

All exceptions are automatically formatted into a consistent JSON response:

```json
{
  "status": 404,
  "message": "User not found",
  "error": "NotFound",
  "details": { "userId": "123" }
}
```

### Custom Error Formatting

Configure global error handling behavior:

```typescript
import { createApp } from '@rhinolabs/boilr';

const app = createApp({
  exceptions: {
    // Custom error formatter
    formatter: (exception, request, reply) => ({
      success: false,
      code: exception.statusCode,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
      data: exception.details
    }),
    
    // Enable/disable error logging (default: true)
    logErrors: true
  }
});
```

### Error Logging

Errors are automatically logged with different levels:
- **4xx errors**: Logged as warnings
- **5xx errors**: Logged as errors

Log format includes:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "error",
  "message": "User not found",
  "status": 404,
  "path": "/api/users/123",
  "method": "GET",
  "details": { "userId": "123" }
}
```

## Examples

Check out complete examples:
- [TypeScript Todo API](https://github.com/rhinolabs/boilr/tree/main/packages/typescript-example)

## License

MIT
