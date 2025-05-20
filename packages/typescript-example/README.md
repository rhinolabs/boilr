# TypeScript Todo API Example

A complete Todo CRUD API example built with the `@rhinolabs/boilr` framework, showcasing TypeScript type safety, file-based routing, and Zod schema validation.

## Features Demonstrated

- ✅ File-based routing with dynamic parameters
- ✅ Type-safe validation using Zod schemas
- ✅ Automatic OpenAPI/Swagger documentation
- ✅ CRUD operations with proper status codes and error handling
- ✅ Query parameter filtering
- ✅ Clean separation of schema and handler logic

## Getting Started

```bash
# Install dependencies
pnpm install

# Run the server in development mode
pnpm dev

# Or build and run in production
pnpm build
pnpm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | List all todos (filter with `?completed=true/false`) |
| POST | `/api/todos` | Create a new todo |
| GET | `/api/todos/:id` | Get a specific todo by ID |
| PUT | `/api/todos/:id` | Update a todo |
| DELETE | `/api/todos/:id` | Delete a todo |

## Swagger Documentation

API documentation is automatically generated from your Zod schemas and available at:

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
└── server.ts              # Server configuration
```

## Key Implementation Examples

### 1. Server Configuration (server.ts)

```typescript
import { createApp } from "@rhinolabs/boilr";

// Create the application
const app = createApp({
  server: {
    port: 3000,
    logger: { /* ... */ },
  },
  routes: {
    dir: './routes',
    prefix: "/api",
  },
  plugins: {
    swagger: { /* ... */ },
  },
});

// Start the server
app.start();
```

### 2. Route with Dynamic Parameter ([id].ts)

```typescript
import { z } from "zod";
import { type GetHandler, defineSchema } from "@rhinolabs/boilr";

export const schema = defineSchema({
  get: {
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: z.object({ /* ... */ }),
      404: z.object({ /* ... */ }),
    },
  },
});

export const get: GetHandler<typeof schema> = async (request, reply) => {
  const { id } = request.params;
  // ... implementation
};
```

## Learn More

For more information about Boilr and related technologies:

- [Boilr Framework Documentation](https://github.com/rhinolabs/boilr)
- [Zod Documentation](https://github.com/colinhacks/zod)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)

## License

MIT
