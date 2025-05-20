# boilr

A convention-based Fastify framework with batteries included. boilr is to Fastify what Next.js is to React.

## Monorepo Structure

This project is structured as a monorepo using pnpm workspaces:

- **`packages/boilr`** - Main framework package (`@rhinolabs/boilr`)  
  The core Boilr framework that provides the convention-based wrapper around Fastify.

- **`packages/cli`** - Command-line interface (`@rhinolabs/boilr-cli`)  
  Tools for creating new projects, development, building, and running Boilr applications.

- **`packages/fastify-file-routes`** - File-based routing plugin (`@rhinolabs/fastify-file-routes`)  
  Next.js-style file-based routing system for Fastify.

- **`packages/typescript-example`** - Example application  
  A complete sample application built with Boilr that demonstrates key features.

## Overview

Boilr simplifies building TypeScript APIs with Fastify by providing:

- **File-based routing** with Next.js-style conventions
- **Type-safe validation** with Zod integration
- **Automatic OpenAPI documentation**
- **Pluggable architecture** with sensible defaults
- **Command-line tools** for scaffolding, development, and deployment

## Getting Started

The fastest way to start using Boilr is with the CLI:

```bash
# Install the CLI globally
npm install -g @rhinolabs/boilr-cli

# Create a new project
boilr new my-api-project

# Move to the project directory
cd my-api-project

# Install dependencies
npm install

# Start development server
npm run dev
```

For more detailed instructions, check the documentation for each package:

- [`@rhinolabs/boilr`](./packages/boilr/README.md) - Main framework
- [`@rhinolabs/boilr-cli`](./packages/cli/README.md) - Command-line tools
- [`@rhinolabs/fastify-file-routes`](./packages/fastify-file-routes/README.md) - File-based routing
- [Example Application](./packages/typescript-example/README.md) - Complete sample app

## Key Features

### 📁 File-Based Routing

Routes are automatically created based on your file structure:

```
routes/
├── api/
│   ├── users/
│   │   ├── [id].ts       → GET /api/users/:id
│   │   └── index.ts      → GET /api/users
│   └── index.ts          → GET /api
├── (admin)/              → Group routes without affecting URL
│   └── settings.ts       → GET /settings
└── [...catchAll].ts      → Wildcard route
```

### 🔍 Type-Safe Validation

Define schemas and handlers with full type safety:

```typescript
// routes/api/users/[id].ts
import { z } from 'zod';
import { type GetHandler, defineSchema } from '@rhinolabs/boilr';

export const schema = defineSchema({
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
});

export const get: GetHandler<typeof schema> = async (request, reply) => {
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

### 📚 Automatic Documentation

Your API documentation is automatically generated from your Zod schemas:

```typescript
// server.ts
import { createApp } from '@rhinolabs/boilr';

// Create the application
const app = createApp({
  server: {
    port: 3000
  },
  plugins: {
    swagger: {
      info: {
        title: 'My API',
        description: 'API built with Boilr',
        version: '1.0.0'
      }
    }
  }
});

// Start the server
app.start();
```

Access your API documentation at `/docs` (configurable).

### 🛠️ Command-Line Tools

Boilr comes with a powerful CLI for managing your project:

```bash
# Create a new project
boilr new my-api-project

# Start development server with hot reloading
boilr dev

# Build for production
boilr build

# Start production server
boilr start
```

## Development

```bash
# Clone the repository
git clone https://github.com/rhinolabs/boilr.git
cd boilr

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
