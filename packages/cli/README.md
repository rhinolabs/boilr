# Boilr CLI

CLI tools for the Boilr framework that simplify the development, building and deployment of Boilr applications.

## Installation

```bash
# Global installation (recommended)
npm install -g @rhinolabs/boilr-cli

# Local installation
npm install --save-dev @rhinolabs/boilr-cli
```

## Commands

### Create a new project

```bash
boilr new my-api-project
```

This command scaffolds a new Boilr project with:
- TypeScript configuration
- Recommended directory structure
- Base server file
- Example API route
- ESM modules support

### Start development server

```bash
boilr dev
```

Starts the development server with hot reloading using nodemon.

### Build for production

```bash
boilr build
```

Compiles TypeScript files and prepares the application for production deployment.

### Start production server

```bash
boilr start
```

Runs the built application in production mode.

### Display help

```bash
boilr help
```

Shows information about available commands.

## Interactive Mode

Running `boilr` without arguments starts an interactive prompt to select a command.

## Project Structure

Boilr CLI creates projects with the following structure:

```
my-api-project/
├── src/
│   ├── routes/
│   │   └── api/
│   │       └── index.ts  # Example API route
│   └── server.ts         # Server entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Development

The CLI package is organized into modular commands:

```
src/
├── commands/         # Command implementations
│   ├── build.ts      # Build command
│   ├── dev.ts        # Development server
│   ├── help.ts       # Help command
│   ├── index.ts      # Commands index
│   ├── new.ts        # Project creation
│   └── start.ts      # Production server
├── templates/        # Project templates
│   ├── index.ts.template       # Example route template
│   ├── package.json.template   # Package.json template
│   ├── README.md.template      # Project README template
│   ├── server.ts.template      # Server template
│   └── tsconfig.json.template  # TypeScript config template
├── utils/            # Shared utilities
│   ├── filesystem.ts # File system utilities
│   └── process.ts    # Process utilities
└── index.ts          # CLI entry point
```

## License

MIT
