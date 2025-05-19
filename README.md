# noboil

A convention-based Fastify framework with batteries included. noboil is to Fastify what Next.js is to React.

## Features

- Convention-based routing
- Pre-configured security plugins
- Full type-safe API with Zod validation
- Automatic OpenAPI/Swagger documentation
- Standardized middleware system
- Modern development tools with Biome

## Installation

```bash
npm install noboil
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
import { ZodTypeProvider } from 'noboil';

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
import { createApp } from 'noboil';

const app = createApp({
  server: {
    port: 3000
  }
});

app.start();
```

## Configuration

noboil provides sensible defaults but allows complete customization:

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

noboil uses `fastify-type-provider-zod` to provide type-safe validation:

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
import { createRouteMiddleware } from 'noboil';

export const middleware = createRouteMiddleware('auth');

export async function get(request, reply) {
  return { message: 'This is a protected route' };
}
```

## Development Tools

noboil comes with Biome integrated for linting and formatting:

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