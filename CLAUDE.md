# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a pnpm monorepo containing the Boilr framework - a convention-based web framework built on Fastify:

- `packages/boilr/` - Core framework package (`@rhinolabs/boilr`)
- `packages/test/` - Testing utilities package (`@rhinolabs/boilr-test`)
- `packages/cli/` - CLI tools (`@rhinolabs/boilr-cli`) 
- `packages/typescript-example/` - Example Todo API application

## Commands

### Development
```bash
# Install dependencies
pnpm install

# Build all packages (required after changes to boilr core)
pnpm build

# Development mode (watch all packages)
pnpm dev

# Lint and format
pnpm lint
pnpm lint:fix
pnpm format

# Build specific packages
pnpm -r --filter @rhinolabs/boilr build
pnpm -r --filter @rhinolabs/boilr-test build
pnpm -r --filter @rhinolabs/boilr-cli build
```

### Package-specific commands
```bash
# Core framework (packages/boilr/)
cd packages/boilr
pnpm build    # TypeScript compilation
pnpm dev      # Watch mode compilation

# Testing utilities (packages/test/)
cd packages/test
pnpm build    # TypeScript compilation
pnpm dev      # Watch mode compilation

# CLI (packages/cli/)  
cd packages/cli
pnpm build    # Build and copy templates
pnpm dev      # Watch mode

# Example app (packages/typescript-example/)
cd packages/typescript-example
pnpm dev      # Start dev server with hot-reload
pnpm build    # Build for production
pnpm start    # Start production server
```

### Testing
```bash
# Run tests (auto-installs Vitest and @rhinolabs/boilr-test if needed)
boilr test

# Run tests in watch mode
boilr test --watch

# Run tests with coverage
boilr test --coverage

# Run tests with UI
boilr test --ui

# Run tests once (no watch mode)
boilr test --run

# Using npm scripts in project (packages/typescript-example/)
cd packages/typescript-example
pnpm test         # Run tests once
pnpm test:watch   # Run tests in watch mode
pnpm test:coverage # Run tests with coverage
```

## Architecture

### Core Framework (`packages/boilr/`)

The framework follows a plugin-based architecture around Fastify:

- `src/boilr.ts` - Main entry point (`createApp()` function)
- `src/core/` - Core functionality (config, router, server)
- `src/file-routes/` - Convention-based file routing system
- `src/auth/` - Authentication plugin with multiple auth methods
- `src/exceptions/` - HTTP exception classes and error handling
- `src/validation/` - Zod integration for type-safe validation
- `src/plugins/` - Built-in plugins (CORS, Helmet, Rate limiting, Swagger, etc.)

### Key Design Patterns

1. **Convention over Configuration**: File-based routing using Next.js-style patterns
2. **Type Safety**: Full TypeScript integration with Zod for runtime validation
3. **Plugin Architecture**: Extensible through Fastify's plugin ecosystem
4. **Error Handling**: Structured HTTP exceptions with automatic formatting

### File Routes System

Routes are auto-generated from file structure:
- `routes/api/users/[id].ts` → `/api/users/:id`
- `routes/(admin)/settings.ts` → `/settings` (grouped routes)
- `routes/[...catchAll].ts` → Wildcard handling

Each route file exports:
- `schema` - Zod schemas for validation
- HTTP method handlers (`get`, `post`, `put`, `delete`, etc.)

### Authentication System

Multi-method auth support with:
- API Key (header/query/cookie)
- Bearer tokens (JWT)
- Basic HTTP auth
- Cookie-based auth
- Custom validators

Configure via `auth.methods` in app config, apply to routes via schema definition.

### Testing System

Convention-based testing with `@rhinolabs/boilr-test`:

- **Convention over Configuration**: Place test files alongside routes (`*.test.ts`, `*.spec.ts`)
- **Framework**: Vitest for performance and ES module support
- **Test App Creation**: `createTestApp()` utility for isolated testing
- **Type-Safe Testing**: Schema validation helpers using Zod
- **Auth Testing**: Built-in helpers for authentication testing
- **CLI Integration**: `boilr test` command with auto-setup

#### Test File Structure
```
src/routes/
  todos/
    index.ts      # Route implementation
    index.test.ts # Route tests
    [id].ts
    [id].test.ts
```

#### Testing Utilities
- `createTestApp()` - Creates isolated test instance
- `createMockRequest()` - Builds test requests
- `withAuth()` - Adds authentication to requests
- `matchesSchema()` - Validates responses against Zod schemas
- `expectStatusCode()` - Assert HTTP status codes
- `parseJsonResponse()` - Parse and validate JSON responses

## Build & Commands
- **Build all packages**: `pnpm build` (root) or `pnpm -r build`
- **Development**: `pnpm dev` (root) or `pnpm -r --parallel dev`
- **Lint**: `biome check .` (fix: `biome check . --fix --unsafe`)
- **Format**: `biome format . --fix`
- **Package-specific build**: `cd packages/[package] && pnpm build`

## Code Style
- **Language**: TypeScript with ES2022+ features
- **Module system**: ES modules (`.js` imports, `type: "module"`)
- **Formatting**: Biome with 2-space indents, 120 char line width, semicolons always
- **Types**: Strict TypeScript, explicit types for public APIs, use `type` for type-only imports
- **Imports**: Organize imports enabled, use `.js` extensions for local imports
- **Naming**: camelCase for variables/functions, PascalCase for classes/interfaces/types
- **Error handling**: Custom exceptions in `exceptions/` with proper HTTP status codes
- **Comments**: Minimal inline comments, JSDoc for public APIs only, always in English
- **Files**: Use kebab-case for filenames, `.ts` extension

## Architecture
- Monorepo with pnpm workspaces
- Convention-based Fastify framework with file-based routing
- Zod for validation, plugin-based architecture
- Solo cuando te pida hacer commits, hazlos con un titulo solo, sin decriptions
- Never add inline comments in the code, just add jsdoc if neccesary

## Important Development Notes

**Building Changes**: Any changes made to the core framework (`packages/boilr/`) require building before testing in the example app:

```bash
# After making changes to packages/boilr/
cd packages/boilr && pnpm build

# Or build from root
pnpm -r --filter @rhinolabs/boilr build

# Then test in example app
cd packages/typescript-example && pnpm dev
```

This is because the example app uses `workspace:*` dependencies, which link to the built `dist/` output.

## Testing

No test framework is currently configured. Check individual package.json files for any test scripts before assuming testing capabilities.
