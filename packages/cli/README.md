# @boilrjs/cli

Command-line interface for the BoilrJs framework. Provides tools for creating, developing, building, and running BoilrJs applications with hot-reload and TypeScript support.

<p align="center">
  <img src="https://img.shields.io/npm/v/@boilrjs/cli" alt="npm version">
  <img src="https://img.shields.io/npm/l/@boilrjs/cli" alt="license">
</p>

## Installation

```bash
# Install globally for easy access
npm install -g @boilrjs/cli

# Or use directly with npx
npx @boilrjs/cli [command]
```

## Commands

### `boilrjs new [name]` - Create New Project

Initialize a new BoilrJs project with TypeScript template and example routes.

```bash
boilrjs new my-api-project
cd my-api-project
npm install
npm run dev
```

**Options:**

- `--template <template>` - Template to use (default: "typescript")
- `--skip-install` - Skip automatic dependency installation

### `boilrjs dev` - Development Server

Start the development server with hot-reload and file watching.

```bash
boilrjs dev
```

**Options:**

- `-p, --port <number>` - Specify the port (default: 3000)
- `-h, --host <host>` - Specify the host (default: localhost)
- `-w, --watch` - Watch for file changes (default: true)

**Features:**

- Automatic restart on file changes
- TypeScript compilation
- Real-time error reporting
- Fast rebuild times

### `boilrjs build` - Production Build

Build the BoilrJs application for production deployment.

```bash
boilrjs build
```

**Options:**

- `-c, --config <path>` - Specify custom config file path

**Features:**

- TypeScript compilation
- Optimized for production
- Tree shaking and minification
- Source map generation

### `boilrjs start` - Production Server

Start the production server using the built application.

```bash
boilrjs start
```

**Options:**

- `-p, --port <number>` - Specify the port (default: 3000)
- `-h, --host <host>` - Specify the host (default: localhost)

### Help and Version

```bash
boilrjs --help      # Display help information
boilrjs --version   # Display version information
```

## Quick Start Workflow

```bash
# 1. Create a new project
boilrjs new my-awesome-api

# 2. Navigate to project
cd my-awesome-api

# 3. Install dependencies (if not skipped)
npm install

# 4. Start development
boilrjs dev

# 5. Build for production
boilrjs build

# 6. Start production server
boilrjs start
```

## Development

```bash
# Install dependencies
pnpm install

# Build the CLI
pnpm build

# Watch for changes and rebuild
pnpm dev
```

## License

MIT
