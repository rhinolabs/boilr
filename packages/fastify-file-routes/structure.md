# @rhinolabs/fastify-file-routes

A Fastify plugin that provides a file-based routing system, inspired by Next.js pages router.

## Directory Structure

```
packages/fastify-file-routes/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts               # Entry point, exports the main plugin
│   ├── plugin.ts              # Main Fastify plugin implementation
│   ├── scanner.ts             # Functions for scanning directories and files
│   ├── path-transformer.ts    # File path to URL route transformation
│   ├── route-loader.ts        # Dynamic module loading and route definition
│   ├── types.ts               # Type definitions
│   └── utils.ts               # General utilities
└── examples/
    └── basic/                 # Basic usage example
        ├── server.js
        └── routes/            # Example route structure
            ├── index.js       # Root route /
            ├── users/
            │   ├── index.js   # /users route
            │   └── [id].js    # Dynamic route /users/:id
            └── posts/
                ├── index.js   # /posts route
                └── [...slug].js # Catch-all route /posts/*
```

## Main Features

1. **File-based routes**
   - Direct mapping between file structure and URL routes
   - Support for index.js as root route of a directory

2. **Dynamic segments**
   - `[param].js` → `/route/:param`
   - `[...param].js` → `/route/*` (catch-all)
   - `[[...param]].js` → Optional parameter

3. **Route grouping**
   - Folders with prefix `(group)` that don't affect the URL route
   - Useful for organization without affecting URL structure

4. **HTTP method support**
   - Named export for each HTTP method (get, post, put, etc.)
   - Export of `schema` for Zod validation

5. **TypeScript integration**
   - Complete types for all options and parameters
   - Type inference for route parameters

## Proposed API

```typescript
import fastify from 'fastify';
import { fastifyFileRoutes } from '@rhinolabs/fastify-file-routes';

const app = fastify();

app.register(fastifyFileRoutes, {
  // Required: routes directory (absolute or relative to process.cwd())
  routesDir: './routes',
  
  // Optional: prefix for all routes
  prefix: '/api',
  
  // Optional: scanning options
  options: {
    // File patterns to ignore
    ignore: [/\.test\./, /\.spec\./],
    
    // Custom path transformations
    pathTransform: (path, filename) => { /* ... */ },
    
    // Configuration for all handlers
    globalHooks: { /* fastify hooks */ },
  }
});

app.listen({ port: 3000 });
```

## Route File Format

```typescript
// Schema definitions for validation (optional)
export const schema = {
  get: {
    // Zod or JSON Schema
    params: z.object({ id: z.string() }),
    querystring: z.object({ filter: z.string().optional() }),
    response: {
      200: z.object({ /* ... */ })
    }
  },
  // other methods...
};

// Hook definitions (optional)
export const hooks = {
  preHandler: async (request, reply) => {
    // ...
  }
};

// Handlers for each HTTP method
export async function get(request, reply) {
  // GET implementation
  return { success: true };
}

export async function post(request, reply) {
  // POST implementation
  return reply.status(201).send({ created: true });
}

// Other exports for PUT, DELETE, etc.
```

## Extensions beyond fastify-file-routes

1. **Improved TypeScript support**
   - More precise type inference
   - Better Zod integration

2. **Route groups**
   - Implementation of Next.js 13+ (group) concept

3. **Per-route middleware**
   - Middleware.js to apply to specific groups

4. **Route caching**
   - Optimization for production environments

5. **Integration with @rhinolabs/boilr**
   - Framework-specific functionality