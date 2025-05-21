# @rhinolabs/fastify-file-routes

A Next.js-style file-based routing plugin for Fastify. This plugin is the core routing engine behind the `@rhinolabs/boilr` framework but can be used independently with any Fastify application.

<p align="center">
  <img src="https://img.shields.io/npm/v/@rhinolabs/fastify-file-routes" alt="npm version">
  <img src="https://img.shields.io/npm/l/@rhinolabs/fastify-file-routes" alt="license">
</p>

## Features

- 📁 **Filesystem-based routing** - Your directory structure becomes your API routes
- 📊 **Dynamic parameters** - Support for parameters in routes using `[param]` syntax
- 🌟 **Catch-all routes** - Handle wildcards with `[...param]` syntax
- 🧩 **Route grouping** - Use `(group)` prefix for folders to organize without affecting URLs
- 🚀 **HTTP method exports** - Simply export functions named `get`, `post`, `put`, `patch`, `del`
- 📝 **Schema support** - Export a `schema` object for validation with any schema system
- ⚡ **TypeScript support** - Full type safety when used with TypeScript

## Installation

```bash
npm install @rhinolabs/fastify-file-routes
# or
yarn add @rhinolabs/fastify-file-routes
# or
pnpm add @rhinolabs/fastify-file-routes
```

## Basic Usage

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
│   ├── index.js        # GET/POST /users 
│   └── [id].js         # GET/PUT/PATCH/DELETE /users/:id
├── posts/
│   ├── index.js        # GET/POST /posts
│   └── [...slug].js    # GET/POST/etc. /posts/*
└── (admin)/            # Route grouping (doesn't affect URL)
    └── settings.js     # GET /settings
```

### Define route handlers

Create route handlers by exporting named functions matching the HTTP methods:

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

// PUT handler
export async function put(request, reply) {
  const { id } = request.params;
  return { id, updated: true };
}

// PATCH handler
export async function patch(request, reply) {
  const { id } = request.params;
  return { id, patched: true };
}

// DELETE handler (using 'del' not 'delete')
export async function del(request, reply) {
  const { id } = request.params;
  return { id, deleted: true };
}
```

## Route Mapping Examples

| File Path | HTTP Method | Route Path |
|-----------|------------|------------|
| `routes/index.js` | GET | `/` |
| `routes/users/index.js` | GET | `/users` |
| `routes/users/[id].js` | GET | `/users/:id` |
| `routes/posts/[...slug].js` | GET | `/posts/*` |
| `routes/(admin)/settings.js` | GET | `/settings` |

## Working with Route Parameters

### Basic Parameters

```typescript
// routes/users/[id].js
export async function get(request, reply) {
  const { id } = request.params;
  return { id };
}
```

### Catch-all Parameters

```typescript
// routes/docs/[...path].js
export async function get(request, reply) {
  const { path } = request.params; // Will be an array of segments
  return { path };
}
```

### Optional Catch-all Parameters

```typescript
// routes/[[...slug]].js - matches / or any path
export async function get(request, reply) {
  const { slug = [] } = request.params; // Will be undefined or an array
  return { slug };
}
```

## Advanced Configuration

```typescript
app.register(fastifyFileRoutes, {
  routesDir: './routes',
  prefix: '/api',
  options: {
    // File patterns to ignore
    ignore: [/\.test\.js$/, /\.spec\.js$/],
    
    // File extensions to include (defaults to .js, .cjs, .mjs, .ts)
    extensions: ['.js', '.ts'],
    
    // Custom path transformation function
    pathTransform: (path, filename) => {
      return path.toLowerCase();
    }
  }
});
```

## Schema Validation

Works seamlessly with Fastify's schema validation:

```typescript
// With Zod (requires fastify-zod or similar)
import { z } from 'zod';

export const schema = {
  get: {
    params: z.object({
      id: z.string()
    }),
    response: {
      200: z.object({
        id: z.string(),
        name: z.string()
      })
    }
  }
};
```

## License

MIT
