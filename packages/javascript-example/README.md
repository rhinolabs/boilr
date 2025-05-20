# Todo CRUD Example

This is a simple Todo CRUD API example built with the [@rhinolabs/boilr](https://github.com/rhinolabs/framework) framework.

## Features

- File-based routing with Next.js-like conventions
- Type-safe validation with Zod
- Automatic Swagger documentation
- CRUD operations for todos

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# From the monorepo root
pnpm install
```

### Running the Example

```bash
# From the monorepo root
pnpm --filter javascript-example start
```

Or navigate to the example directory:

```bash
cd packages/javascript-example
pnpm start
```

The server will start on http://localhost:3000.

## API Endpoints

| Method | Path           | Description         |
|--------|----------------|---------------------|
| GET    | /api/todos     | List all todos      |
| GET    | /api/todos/:id | Get a single todo   |
| POST   | /api/todos     | Create a new todo   |
| PUT    | /api/todos/:id | Update a todo       |
| DELETE | /api/todos/:id | Delete a todo       |

## API Documentation

Swagger documentation is available at http://localhost:3000/docs when the server is running.

## Request Examples

### Create a Todo

```bash
curl -X 'POST' \
  'http://localhost:3000/api/todos' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Learn boilr framework",
  "completed": false
}'
```

### Get All Todos

```bash
curl -X 'GET' 'http://localhost:3000/api/todos'
```

### Get a Single Todo

```bash
curl -X 'GET' 'http://localhost:3000/api/todos/1'
```

### Update a Todo

```bash
curl -X 'PUT' \
  'http://localhost:3000/api/todos/1' \
  -H 'Content-Type: application/json' \
  -d '{
  "completed": true
}'
```

### Delete a Todo

```bash
curl -X 'DELETE' 'http://localhost:3000/api/todos/1'
```

## License

MIT