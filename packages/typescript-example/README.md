# TypeScript Example for @rhinolabs/boilr

This is a simple TypeScript example demonstrating a Todo CRUD API using the @rhinolabs/boilr framework with file-based routing similar to Next.js.

## Features

- TypeScript support
- File-based routing (Next.js style)
- Schema validation with Zod
- In-memory Todo CRUD operations
- Auto-generated Swagger documentation

## Running the Example

```bash
# Install dependencies
pnpm install

# Build the TypeScript code
pnpm build

# Run the server
pnpm start

# For development with auto-reload
pnpm dev
```

## API Endpoints

- `GET /` - Root endpoint with API information
- `GET /api/todos` - List all todos
- `GET /api/todos/:id` - Get a specific todo
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

## Swagger Documentation

Swagger documentation is automatically generated and available at:

```
http://localhost:3002/docs
```