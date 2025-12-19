---
title: Getting Started
description: a description
---

# @boilrjs/core

A convention-based web framework built on top of Fastify, designed to streamline API development through standardized patterns and built-in features. Developed by Rhinolabs Agency, it follows a "batteries included" philosophy while maintaining the performance benefits of the underlying Fastify engine.

## Monorepo Structure

This project is structured as a monorepo using pnpm workspaces:

- **`packages/boilr`** - Core framework package (`@boilrjs/core`)  
  The main BoilrJs framework that provides convention-based routing, configuration, and plugin management around Fastify.

- **`packages/cli`** - Command-line interface (`@boilrjs/cli`)  
  Tools for creating new projects, development server with hot-reload, building, and running BoilrJs applications.

- **`packages/typescript-example`** - Example application  
  A complete Todo CRUD API demonstrating Boilr's key features including type-safe validation and automatic documentation.

## Overview

BoilrJs simplifies building TypeScript APIs with Fastify by providing:

- **Convention-based file routing** with Next.js-style patterns
- **Integrated schema validation** using Zod with automatic type inference
- **Automatic OpenAPI documentation** generation from Zod schemas with error response schemas
- **Built-in error handling** with comprehensive exception classes and automatic HTTP status codes
- **Preconfigured security and performance optimizations** (CORS, Helmet, Rate limiting)
- **Developer-friendly tooling** for rapid development and deployment
- **TypeScript support** with full type inference and safety

## Getting Started

The fastest way to start using BoilrJs is with the CLI:

```bash
# Install the CLI globally
npm install -g @boilrjs/cli

# Create a new project
boilrjs new my-api-project

# Move to the project directory
cd my-api-project

# Install dependencies
npm install

# Start development server with hot-reload
npm run dev
```

For more detailed instructions, check the documentation for each package:

- [`@boilrjs/core`](./packages/boilr/README.md) - Core framework with routing and validation
- [`@boilrjs/cli`](./packages/cli/README.md) - Command-line development tools
- [Example Application](./packages/typescript-example/README.md) - Complete Todo API sample

## Key Features

### 📁 Convention-Based File Routing

Routes are automatically created based on your file structure following Next.js conventions:

```
routes/
├── api/
│   ├── users/
│   │   ├── [id].ts       → GET/PUT/DELETE /api/users/:id
│   │   └── index.ts      → GET/POST /api/users
│   └── index.ts          → GET /api
├── (admin)/              → Group routes without affecting URL structure
│   └── settings.ts       → GET /settings
└── [...catchAll].ts      → Wildcard route handling
```

### 🔍 Type-Safe Schema Validation

Define schemas and handlers with full TypeScript type safety using Zod:

```typescript
// routes/api/users/[id].ts
import { z } from 'zod';
import { type GetHandler, defineSchema, NotFoundException } from '@boilrjs/core';

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
      })
    }
  }
});

export const get: GetHandler<typeof schema> = async (request) => {
  const { id } = request.params; // Automatically typed as number
  
  const user = await getUserById(id);
  
  if (!user) {
    throw new NotFoundException(`User with id ${id} not found`);
  }
  
  return user; // Return type automatically validated
};
```

### 🚨 Error Handling

Built-in HTTP exception classes with automatic error formatting and validation:

```typescript
import { NotFoundException, ValidationException } from '@boilrjs/core';

// Throw structured HTTP exceptions
throw new NotFoundException('User not found');

// Handle validation errors automatically
throw new ValidationException('Invalid data', validationErrors);
```

### 🔐 Authentication System

Flexible multi-method authentication with automatic token extraction:

```typescript
// Configure authentication methods
const app = createApp({
  auth: {
    methods: [
      {
        name: 'jwt',
        type: 'bearer', // Auto-extracts Bearer token
        validator: async (request, token) => {
          const user = await verifyJwtToken(token);
          return { user };
        }
      }
    ]
  }
});

// Apply to routes selectively
export const schema = defineSchema({
  get: {
    auth: ['jwt'], // or auth: true, or auth: false
    response: { 200: UserSchema }
  }
});
```

### 📚 Automatic API Documentation

Your OpenAPI/Swagger documentation is automatically generated from your Zod schemas, including automatic error response schemas:

```typescript
// server.ts
import { createApp } from '@boilrjs/core';

const app = createApp({
  server: {
    port: 3000
  },
  plugins: {
    swagger: {
      info: {
        title: 'My API',
        description: 'API built with BoilrJs',
        version: '1.0.0'
      }
    }
  }
});

app.start(); // Documentation available at /docs
```

### 🛠️ Developer Experience

Powerful CLI tools for seamless development workflow:

```bash
# Create a new project with TypeScript template
boilrjs new my-api-project

# Start development server with hot-reload
boilrjs dev

# Build optimized production bundle
boilrjs build

# Start production server
boilrjs start
```

## Architecture

The framework leverages modern TypeScript features and provides:

- **Modular plugin system** - Extend functionality through Fastify's plugin ecosystem
- **Convention over configuration** - Sensible defaults with customization options
- **Performance focused** - Built on Fastify's high-performance foundation
- **Developer friendly** - Hot-reload, automatic documentation, type safety

## Development

```bash
# Clone the repository
git clone https://github.com/rhinolabs/boilr.git
cd boilr

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run development mode (watch all packages)
pnpm dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
