# TypeScript Todo API Example

A complete Todo CRUD API example built with the `@boilrjs/core` framework, showcasing TypeScript type safety, file-based routing, Zod schema validation, and automatic OpenAPI documentation generation.

## Features Demonstrated

- ✅ **File-based routing** with dynamic parameters (`[id].ts`)
- ✅ **Type-safe validation** using Zod schemas with automatic TypeScript inference
- ✅ **Automatic OpenAPI/Swagger documentation** generated from schemas
- ✅ **CRUD operations** with proper HTTP status codes and error handling
- ✅ **Query parameter filtering** (e.g., `?completed=true/false`)
- ✅ **Security features** (CORS, Helmet, Rate limiting)
- ✅ **Development workflow** with hot-reload and TypeScript compilation

## Getting Started

```bash
# Install dependencies
pnpm install

# Run the server in development mode with hot-reload
pnpm dev

# Or build and run in production
pnpm build
pnpm start
```

The server will start on `http://localhost:3000` with the following features:
- API endpoints at `/api/todos`
- Interactive documentation at `/docs`
- Hot-reload in development mode

## API Endpoints

| Method | Endpoint | Description | Example |
|--------|----------|-------------|---------|
| GET | `/api/todos` | List all todos | `?completed=true` to filter |
| POST | `/api/todos` | Create a new todo | `{"title": "Learn Boilrjs", "completed": false}` |
| GET | `/api/todos/:id` | Get a specific todo by ID | `/api/todos/1` |
| PUT | `/api/todos/:id` | Update a todo completely | `{"title": "Updated", "completed": true}` |
| DELETE | `/api/todos/:id` | Delete a todo | Returns `204 No Content` |

## Swagger Documentation

Interactive API documentation is automatically generated from your Zod schemas:

```
http://localhost:3000/docs
```

## Project Structure

```
src/
├── routes/
│   └── api/
│       └── todos/
│           ├── [id].ts    # Get/Update/Delete todo by ID
│           └── index.ts   # List/Create todos
└── server.ts              # Server configuration with plugins
```

## Key Implementation Examples

### 1. Server Configuration (server.ts)

```typescript
import { createApp } from "@boilrjs/core";

const app = createApp({
  server: {
    port: 3000,
    logger: {
      level: "info",
      transport: {
        target: "pino-pretty",
        options: { colorize: true }
      }
    }
  },
  routes: {
    dir: './routes',
    prefix: "/api"
  },
  plugins: {
    swagger: {
      info: {
        title: "Todo API",
        description: "A simple Todo CRUD API built with Boilrjs",
        version: "1.0.0"
      }
    }
  }
});

app.start();
```

### 2. Route with Dynamic Parameter ([id].ts)

```typescript
import { z } from "zod";
import { type GetHandler, defineSchema } from "@boilrjs/core";

export const schema = defineSchema({
  get: {
    params: z.object({
      id: z.string()
    }),
    response: {
      200: z.object({
        id: z.string(),
        title: z.string(),
        completed: z.boolean()
      }),
      404: z.object({
        error: z.string(),
        message: z.string()
      })
    }
  }
});

export const get: GetHandler<typeof schema> = async (request, reply) => {
  const { id } = request.params;
  // Implementation with full type safety
};
```

## Learn More

For more information about BoilrJs and related technologies:

- [BoilrJs Framework Documentation](https://github.com/rhinolabs/boilr)
- [Zod Documentation](https://github.com/colinhacks/zod)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)

## License

MIT
