# @rhinolabs/boilr

A convention-based Fastify framework with batteries included. Boilr brings Next.js-inspired simplicity and TypeScript type safety to Fastify API development.

<p align="center">
  <img src="https://img.shields.io/npm/v/@rhinolabs/boilr" alt="npm version">
  <img src="https://img.shields.io/npm/l/@rhinolabs/boilr" alt="license">
  <img src="https://img.shields.io/github/stars/rhinolabs/boilr" alt="github stars">
</p>

## Features

- **🗂️ File-based routing** - Next.js style API routes with dynamic parameters and catch-all support
- **🛡️ Type-safe validation** - First-class Zod integration with TypeScript type inference
- **📚 Auto-generated API docs** - Swagger/OpenAPI documentation from your schemas
- **🔌 Batteries included** - CORS, Helmet, Rate limiting and other security plugins pre-configured
- **🧩 Plugin system** - Built on Fastify's powerful plugin architecture
- **🛠️ Developer experience** - CLI tools, hot-reload, and comprehensive TypeScript support

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

## Built-in Features

### Security & Performance
- **CORS** - Cross-origin resource sharing with configurable options
- **Helmet** - Security headers for protection against common vulnerabilities
- **Rate Limiting** - Request throttling to prevent abuse
- **Schema Validation** - Automatic request/response validation with Zod

### Developer Experience
- **TypeScript First** - Full type safety and inference
- **Hot Reload** - Development server with automatic restart
- **Auto Documentation** - OpenAPI/Swagger docs generated from schemas
- **CLI Tools** - Project scaffolding and development commands

## Examples

Check out complete examples:
- [TypeScript Todo API](https://github.com/rhinolabs/boilr/tree/main/packages/typescript-example)

## License

MIT
