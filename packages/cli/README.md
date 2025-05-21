# @rhinolabs/boilr-cli

Command-line interface for the Boilr framework. Provides tools for creating, developing, building, and running Boilr applications with hot-reload and TypeScript support.

<p align="center">
  <img src="https://img.shields.io/npm/v/@rhinolabs/boilr-cli" alt="npm version">
  <img src="https://img.shields.io/npm/l/@rhinolabs/boilr-cli" alt="license">
</p>

## Installation

```bash
# Install globally for easy access
npm install -g @rhinolabs/boilr-cli

# Or use directly with npx
npx @rhinolabs/boilr-cli [command]
```

## Commands

### `boilr new [name]` - Create New Project

Initialize a new Boilr project with TypeScript template and example routes.

```bash
boilr new my-api-project
cd my-api-project
npm install
npm run dev
```

**Options:**
- `--template <template>` - Template to use (default: "typescript")
- `--skip-install` - Skip automatic dependency installation

### `boilr dev` - Development Server

Start the development server with hot-reload and file watching.

```bash
boilr dev
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

### `boilr build` - Production Build

Build the Boilr application for production deployment.

```bash
boilr build
```

**Options:**
- `-c, --config <path>` - Specify custom config file path

**Features:**
- TypeScript compilation
- Optimized for production
- Tree shaking and minification
- Source map generation

### `boilr start` - Production Server

Start the production server using the built application.

```bash
boilr start
```

**Options:**
- `-p, --port <number>` - Specify the port (default: 3000)
- `-h, --host <host>` - Specify the host (default: localhost)

### Help and Version

```bash
boilr --help      # Display help information
boilr --version   # Display version information
```

## Quick Start Workflow

```bash
# 1. Create a new project
boilr new my-awesome-api

# 2. Navigate to project
cd my-awesome-api

# 3. Install dependencies (if not skipped)
npm install

# 4. Start development
boilr dev

# 5. Build for production
boilr build

# 6. Start production server
boilr start
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
