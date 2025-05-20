# @rhinolabs/boilr

A convention-based Fastify framework with batteries included. Boilr takes the power of Fastify and adds conventions, plugins and utilities that make building APIs faster and more enjoyable.

## Features

- **Next.js style file-based routing** - Support for dynamic parameters, catch-all routes, and route grouping
- **Schema validation** - Built-in support for Zod schemas
- **Plugins included** - Common plugins like cors, helmet, and rate limiting are included and pre-configured
- **Middleware support** - Easy way to add global and route-specific middleware
- **Swagger documentation** - Automatically generated API documentation

## Installation

```bash
npm install @rhinolabs/boilr
# or
yarn add @rhinolabs/boilr
# or
pnpm add @rhinolabs/boilr
```

## Quick Start

```typescript
import { createApp } from '@rhinolabs/boilr';

const app = createApp({
  routes: {
    dir: './routes',
    prefix: '/api'
  }
});

app.start();
```

## Route File Example

```typescript
// routes/users/[id].ts
import { z } from 'zod';

// Schema definition (optional)
export const schema = {
  get: {
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: z.object({
        id: z.string(),
        name: z.string(),
      }),
    },
  },
};

// GET handler
export async function get(request, reply) {
  const { id } = request.params;
  return { id, name: `User ${id}` };
}

// POST handler
export async function post(request, reply) {
  const { id } = request.params;
  return reply.status(201).send({ id, created: true });
}
```

## Routing Features

Boilr uses Next.js style file-based routing with these features:

- **Route grouping** - Use `(group)` in folder names to organize routes without affecting URL structure
- **Catch-all routes** - Use `[...param]` syntax for catch-all routes
- **Optional catch-all** - Use `[[...param]]` syntax for optional catch-all parameters
- **Dynamic segments** - Use `[param]` syntax for dynamic route parameters

## Configuration

Boilr has sensible defaults but can be customized with these options:

```typescript
interface BoilrConfig {
  server?: {
    port?: number;         // Default: 3000
    host?: string;         // Default: '0.0.0.0'
    logger?: boolean;      // Default: true
  };
  routes?: {
    dir?: string;          // Default: './routes'
    prefix?: string;       // Default: ''
    options?: {
      ignore?: RegExp[];   // Patterns of files to ignore
      extensions?: string[]; // File extensions to include
    };
  };
  plugins?: {
    helmet?: boolean;      // Default: true
    rateLimit?: boolean;   // Default: true
    cors?: boolean;        // Default: true
    swagger?: boolean;     // Default: true
  };
  middleware?: {
    global?: string[];     // Default: ['logger', 'commonHeaders']
  };
  validation?: boolean;    // Default: true
  fastify?: FastifyServerOptions;
}
```

## License

MIT