# boilr

A convention-based Fastify framework with batteries included. boilr is to Fastify what Next.js is to React.

## Monorepo Structure

This project is structured as a monorepo using pnpm workspaces:

- `packages/core`: The main boilr framework (`@rhinolabs/boilr`)
- `packages/demo-app`: A demo application showcasing the framework

## Features

- Convention-based routing
- Pre-configured security plugins
- Full type-safe API with Zod validation
- Automatic OpenAPI/Swagger documentation
- Standardized middleware system
- Modern development tools with Biome

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/rhinolabs/framework.git
cd framework

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run the demo application
pnpm demo
```

### Using in your project

```bash
npm install @rhinolabs/boilr
```

## Quick Start

Create a routes directory with your API endpoints:

```
my-app/
├── routes/
│   ├── index.ts          # GET / 
│   ├── api/
│   │   ├── users/
│   │   │   ├── index.ts  # GET /api/users
│   │   │   └── [id].ts   # GET /api/users/:id
```

Create a route with type-safe validation using Zod:

```typescript
// routes/api/users/[id].ts
import { z } from 'zod';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider } from '@rhinolabs/boilr';

export const schema = {
  get: {
    params: z.object({
      id: z.string().transform(val => parseInt(val, 10))
    }),
    response: {
      200: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().email()
      }),
      404: z.object({
        error: z.string(),
        message: z.string()
      })
    }
  }
};

export async function get(
  request: FastifyRequest<{
    Params: z.infer<typeof schema.get.params>;
  }, ZodTypeProvider>,
  reply: FastifyReply
) {
  const { id } = request.params;
  
  // Your logic here
  const user = await getUserById(id);
  
  if (!user) {
    return reply.code(404).send({
      error: 'Not Found',
      message: `User with id ${id} not found`
    });
  }
  
  return user;
}
```

Start your server:

```typescript
// server.ts
import { createApp } from '@rhinolabs/boilr';

const app = createApp({
  server: {
    port: 3000
  }
});

app.start();
```

## File-Based Routing

boilr uses a file-based routing system inspired by Next.js, making it easy to create and manage API endpoints.

### Route Definition

Routes are automatically created based on your file structure:

```
routes/                     # Base directory
├── index.ts                # GET /
├── about.ts                # GET /about
├── api/
│   ├── health.ts           # GET /api/health
│   ├── webhook.[post].ts   # POST /api/webhook
│   └── users/
│       ├── index.ts        # GET/POST /api/users
│       └── [id].ts         # GET/PUT/DELETE /api/users/:id
```

### Route Naming Conventions

- **Standard routes**: `filename.ts` maps to `/filename`
- **Index routes**: `index.ts` maps to the directory path
- **Dynamic routes**: `[param].ts` maps to `/:param`
- **Method-specific routes**: `filename.[method].ts` defines a specific HTTP method only

### Route Handlers

You can define route handlers in several ways:

1. **Named export functions** (preferred method):

```typescript
// Multiple HTTP methods in one file
export async function get(request, reply) {
  return { message: "This is a GET request" };
}

export async function post(request, reply) {
  return { message: "This is a POST request" };
}
```

2. **Default export object**:

```typescript
// Multiple HTTP methods in one file
export default {
  async get(request, reply) {
    return { message: "This is a GET request" };
  },
  async post(request, reply) {
    return { message: "This is a POST request" };
  }
};
```

3. **Default export function** (for single method or method specified in filename):

```typescript
// A single handler for the HTTP method specified in the filename
// or for all HTTP methods if not specified
export default async function(request, reply) {
  return { message: "This endpoint handles requests" };
}
```

### Schema Validation

Associate Zod schemas with your routes for automatic validation and TypeScript inference:

```typescript
import { z } from 'zod';

// Define schemas for each HTTP method
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
  },
  post: {
    body: z.object({
      name: z.string()
    }),
    response: {
      201: z.object({
        id: z.string(),
        name: z.string(),
        created: z.boolean()
      })
    }
  }
};
```

### Advanced Usage

For more control, you can also use the route adapter directly:

```typescript
import { registerFileRoutes } from '@rhinolabs/boilr';
import fastify from 'fastify';

const app = fastify();

// Register routes manually
await registerFileRoutes(app, './routes', '/api');

await app.listen({ port: 3000 });
```

## Configuration

boilr provides sensible defaults but allows complete customization:

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
        description: 'My awesome API',
        version: '1.0.0'
      }
    }
  },
  
  middleware: {
    global: ['logger', 'commonHeaders']
  },
  
  validation: true // Enable/disable Zod validation
});
```

## Zod Schema Validation

boilr uses `fastify-type-provider-zod` to provide type-safe validation:

```typescript
// Example of schema definition with Zod
export const schema = {
  post: {
    body: z.object({
      username: z.string().min(3),
      email: z.string().email(),
      age: z.number().int().positive().optional()
    }),
    response: {
      201: z.object({
        id: z.string().uuid(),
        username: z.string(),
        email: z.string().email()
      }),
      400: z.object({
        error: z.string(),
        issues: z.array(z.object({
          path: z.array(z.string()),
          message: z.string()
        }))
      })
    }
  }
};
```

The validation provides:
- Runtime type checking
- Automatic TypeScript inference
- Auto-generated OpenAPI/Swagger documentation
- Automatic error responses for invalid data

## Custom Middleware

Register custom middleware:

```typescript
app.registerMiddleware('auth', async (request, reply) => {
  const token = request.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return reply.code(401).send({ error: 'Authentication required' });
  }
  
  try {
    // Verify token
    const decoded = verifyToken(token);
    request.user = decoded;
  } catch (err) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
});
```

Apply middleware to specific routes:

```typescript
// routes/api/private/index.ts
import { createRouteMiddleware } from '@rhinolabs/boilr';

export const middleware = createRouteMiddleware('auth');

export async function get(request, reply) {
  return { message: 'This is a protected route' };
}
```

## Development Tools

boilr comes with Biome integrated for linting and formatting:

```bash
# Lint your code
npm run lint

# Fix linting issues
npm run lint:fix

# Format your code
npm run format
```

## License

MIT