# @rhinolabs/boilr

A convention-based Fastify framework with batteries included. Boilr takes the power of Fastify and adds conventions, plugins and utilities that make building APIs faster and more enjoyable.

## Features

- **Next.js style file-based routing** - Support for dynamic parameters, catch-all routes, and route grouping
- **Schema validation** - Built-in support for Zod schemas
- **Plugins included** - Common plugins like cors, helmet, and rate limiting are included and pre-configured
- **Middleware support** - Easy way to add global and route-specific middleware
- **Swagger documentation** - Automatically generated API documentation
- **CLI tool** - Command line interface for creating and managing projects

## Installation

```bash
# Create a new project using the CLI
npm init -y
npm install @rhinolabs/boilr
npx boilr new my-api
cd my-api
npm install
npm run dev

# Or add to an existing project
npm install @rhinolabs/boilr
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
import { defineSchema, GetHandler, PostHandler } from '@rhinolabs/boilr';

// Enhanced schema definition with type inference
export const schema = defineSchema({
  get: {
    params: z.object({
      id: z.string().transform(val => parseInt(val, 10)),
    }),
    response: {
      200: z.object({
        id: z.number(),
        name: z.string(),
      }),
    },
  },
  post: {
    params: z.object({
      id: z.string().transform(val => parseInt(val, 10)),
    }),
    body: z.object({
      name: z.string().min(1),
    }),
    response: {
      201: z.object({
        id: z.number(),
        created: z.boolean(),
      }),
    },
  },
});

// GET handler with strong typing
export const get: GetHandler<typeof schema> = async (request, reply) => {
  const { id } = request.params; // id is typed as number due to transform
  return { id, name: `User ${id}` };
}

// POST handler with strong typing
export const post: PostHandler<typeof schema> = async (request, reply) => {
  const { id } = request.params; // id is typed as number
  const { name } = request.body; // name is typed as string
  
  return { id, created: true };
}
```

## Routing Features

Boilr uses Next.js style file-based routing with these features:

- **Route grouping** - Use `(group)` in folder names to organize routes without affecting URL structure
- **Catch-all routes** - Use `[...param]` syntax for catch-all routes
- **Optional catch-all** - Use `[[...param]]` syntax for optional catch-all parameters
- **Dynamic segments** - Use `[param]` syntax for dynamic route parameters

### Type-Safe Catch-All Routes

Work with catch-all routes in a type-safe way using the provided utilities:

```typescript
// routes/products/[...path].ts
import { z } from 'zod';
import { defineSchema, GetHandler, catchAllSchema, getCatchAllParam } from '@rhinolabs/boilr';

export const schema = defineSchema({
  get: {
    params: z.object({
      path: catchAllSchema(z.string()), // Special schema for catch-all params
    }),
    response: {
      200: z.object({
        segments: z.array(z.string()),
        fullPath: z.string(),
      }),
    },
  },
});

export const get: GetHandler<typeof schema> = async (request, reply) => {
  // Safely extract the catch-all parameter with proper typing
  const path = getCatchAllParam(request.params, 'path');
  
  // path is properly typed as string[] | string
  const segments = Array.isArray(path) ? path : [path];
  const fullPath = segments.join('/');
  
  return {
    segments,
    fullPath,
  };
};
```

## Complete Todo API Example with Type Safety

Here's a complete example showing how to build a type-safe Todo API:

```typescript
// Todo type definition
import { z } from 'zod';
import { defineSchema, GetHandler, PostHandler, PutHandler, DeleteHandler } from '@rhinolabs/boilr';

// Define the Todo type using Zod
const TodoSchema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

// Export the inferred TypeScript type
type Todo = z.infer<typeof TodoSchema>;

// routes/todos/index.ts
export const schema = defineSchema({
  get: {
    querystring: z.object({
      completed: z.string().optional().transform(val => 
        val ? val === 'true' : undefined
      ),
    }),
    response: {
      200: z.array(TodoSchema),
    },
  },
  post: {
    body: z.object({
      title: z.string().min(1),
      completed: z.boolean().optional().default(false),
    }),
    response: {
      201: TodoSchema,
    },
  },
});

// In-memory database for simplicity
const todos: Todo[] = [
  {
    id: 1,
    title: "Learn rhinolabs framework",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Build a CRUD API",
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

// Type-safe GET handler
export const get: GetHandler<typeof schema> = async (request, reply) => {
  // Type-safe access to query parameters
  const { completed } = request.query;
  
  // Filter by completed status if provided
  const filteredTodos = completed !== undefined
    ? todos.filter(todo => todo.completed === completed)
    : todos;
    
  return filteredTodos;
};

// Type-safe POST handler
export const post: PostHandler<typeof schema> = async (request, reply) => {
  // Type-safe access to the request body
  const { title, completed = false } = request.body;
  
  const newTodo: Todo = {
    id: todos.length + 1,
    title,
    completed,
    createdAt: new Date().toISOString(),
  };
  
  todos.push(newTodo);
  return reply.code(201).send(newTodo);
};
```

```typescript
// routes/todos/[id].ts
import { z } from 'zod';
import { defineSchema, GetHandler, PutHandler, DeleteHandler } from '@rhinolabs/boilr';
// Import the Todo type and in-memory database from index
import { TodoSchema, todos } from './index';

export const schema = defineSchema({
  get: {
    params: z.object({
      id: z.string().transform(val => Number.parseInt(val, 10)),
    }),
    response: {
      200: TodoSchema,
      404: z.object({
        error: z.string(),
        message: z.string(),
      }),
    },
  },
  put: {
    params: z.object({
      id: z.string().transform(val => Number.parseInt(val, 10)),
    }),
    body: z.object({
      title: z.string().min(1).optional(),
      completed: z.boolean().optional(),
    }),
    response: {
      200: TodoSchema,
      404: z.object({
        error: z.string(),
        message: z.string(),
      }),
    },
  },
  delete: {
    params: z.object({
      id: z.string().transform(val => Number.parseInt(val, 10)),
    }),
    response: {
      204: z.null(),
      404: z.object({
        error: z.string(),
        message: z.string(),
      }),
    },
  },
});

// Type-safe GET handler for a specific todo
export const get: GetHandler<typeof schema> = async (request, reply) => {
  const { id } = request.params; // Typed as number thanks to transform
  
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return reply.code(404).send({
      error: "Not Found",
      message: `Todo with id ${id} not found`,
    });
  }
  
  return todo;
};

// Type-safe PUT handler to update a todo
export const put: PutHandler<typeof schema> = async (request, reply) => {
  const { id } = request.params; // Typed as number
  const updates = request.body; // Typed with optional fields
  
  const todoIndex = todos.findIndex(t => t.id === id);
  
  if (todoIndex === -1) {
    return reply.code(404).send({
      error: "Not Found",
      message: `Todo with id ${id} not found`,
    });
  }
  
  // Type-safe update with proper typing
  const updatedTodo = {
    ...todos[todoIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  todos[todoIndex] = updatedTodo;
  
  return updatedTodo;
};

// Type-safe DELETE handler
export const delete_: DeleteHandler<typeof schema> = async (request, reply) => {
  const { id } = request.params; // Typed as number
  
  const todoIndex = todos.findIndex(t => t.id === id);
  
  if (todoIndex === -1) {
    return reply.code(404).send({
      error: "Not Found",
      message: `Todo with id ${id} not found`,
    });
  }
  
  todos.splice(todoIndex, 1);
  
  return reply.code(204).send();
};
```

## Type-Safe Request Handling

The framework provides utilities to help extract and validate request data with proper type inference:

```typescript
import { z } from 'zod';
import { 
  defineSchema, 
  GetHandler,
  getTypedParams,
  getTypedQuery,
  getTypedBody 
} from '@rhinolabs/boilr';

export const schema = defineSchema({
  get: {
    params: z.object({
      id: z.string().transform(val => parseInt(val, 10)),
    }),
    querystring: z.object({
      filter: z.string().optional(),
      page: z.string().transform(val => parseInt(val, 10)).optional(),
    }),
    response: { /* ... */ },
  },
  post: {
    body: z.object({
      name: z.string(),
      email: z.string().email(),
    }),
    response: { /* ... */ },
  }
});

// Example usage of utilities in handlers
export const get: GetHandler<typeof schema> = async (request, reply) => {
  // These utilities provide validation and proper typing
  const params = getTypedParams(request, schema, 'get');
  const query = getTypedQuery(request, schema, 'get');
  
  // params.id is now properly typed as number
  // query.filter is typed as string | undefined
  // query.page is typed as number | undefined
  
  return { /* ... */ };
};

export const post = async (request, reply) => {
  // Body validation with proper typing
  const body = getTypedBody(request, schema, 'post');
  
  // body.name and body.email are properly typed as string
  
  return { /* ... */ };
};
```

## CLI Usage

Boilr comes with a command-line interface that helps you build and run your applications:

```bash
# Create a new project
npx boilr new my-api

# Start development server with hot reloading
npx boilr dev

# Build the project for production
npx boilr build

# Start the production server
npx boilr start

# Show help
npx boilr help
```

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

## Type Safety and Inference

The framework provides strong type inference for all aspects of your API:

- **Route Parameters** - Automatically inferred from your schema definitions
- **Request Body** - Full type safety for request body schemas with proper validation
- **Response Types** - Return types are enforced based on your schema
- **Query Parameters** - Type safety for query strings with automatic parsing
- **Path Parameters** - Full support for dynamic segments and catch-all routes

### Benefits of Type Safety

- **Catches Errors Early** - TypeScript will catch type errors during development
- **Better IDE Support** - Get autocompletion and inline documentation
- **Self-Documenting APIs** - Your schemas serve as both validation and documentation
- **Refactoring Confidence** - Change your data structures with confidence

## Example Projects

Check out the example projects in the packages directory to see complete implementations:

- **typescript-example** - Full TypeScript example with type-safe routes 
- **javascript-example** - JavaScript example that still benefits from the framework's features

## License

MIT