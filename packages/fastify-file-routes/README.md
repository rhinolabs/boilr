# @rhinolabs/fastify-file-routes

A Fastify plugin that provides file-based routing similar to Next.js pages router.

## Features

- **File-based routing**: Map your directory structure directly to API routes
- **Dynamic segments**: Support for parameters in routes using `[param]` syntax
- **Catch-all routes**: Handle wildcard routes with `[...param]` syntax
- **Optional catch-all**: Make catch-all parameters optional with `[[...param]]` syntax
- **Route grouping**: Use `(group)` prefix for folders to organize routes without affecting URL paths
- **HTTP method handlers**: Export functions named after HTTP methods (get, post, put, etc.)
- **Schema validation**: Export a schema object to define validation using Zod

## Installation

```bash
npm install @rhinolabs/fastify-file-routes
# or
yarn add @rhinolabs/fastify-file-routes
# or
pnpm add @rhinolabs/fastify-file-routes
```

## Usage

### Register the plugin

```typescript
import fastify from 'fastify';
import { fastifyFileRoutes } from '@rhinolabs/fastify-file-routes';

const app = fastify();

app.register(fastifyFileRoutes, {
  routesDir: './routes',  // Required: directory containing route files
  prefix: '/api',         // Optional: prefix for all routes
});

app.listen({ port: 3000 });
```

### Create route files

```
routes/
├── index.js            # GET /
├── users/
│   ├── index.js        # GET /users
│   └── [id].js         # GET /users/:id
└── posts/
    ├── index.js        # GET /posts
    └── [...slug].js    # GET /posts/*
```

### Define route handlers

```typescript
// routes/users/[id].js
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

## Route Mapping

| File Path | HTTP Method | Route Path |
|-----------|------------|------------|
| `routes/index.js` | GET | `/` |
| `routes/users/index.js` | GET | `/users` |
| `routes/users/[id].js` | GET | `/users/:id` |
| `routes/posts/[...slug].js` | GET | `/posts/*` |
| `routes/(admin)/settings.js` | GET | `/settings` |

## Configuration Options

```typescript
interface FileRoutesOptions {
  // Required: directory containing route files
  routesDir: string;
  
  // Optional: prefix for all routes
  prefix?: string;
  
  // Additional options
  options?: {
    // File patterns to ignore
    ignore?: RegExp[];
    
    // Custom path transformation function
    pathTransform?: (path: string, filename: string) => string;
    
    // Global hooks to apply to all routes
    globalHooks?: any;
    
    // File extensions to include
    extensions?: string[];
  };
}
```

## License

MIT