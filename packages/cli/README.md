# @rhinolabs/cli

CLI tool for the Boilr framework.

## Installation

```sh
npm install -g @rhinolabs/cli
```

Or use it directly with npx:

```sh
npx @rhinolabs/cli [command]
```

## Commands

* `boilr init [name]` - Initialize a new Boilr project
  * `--template <template>` - Template to use (default: "default")
  * `--typescript` - Use TypeScript (default: true)
  * `--skip-install` - Skip dependency installation

* `boilr dev` - Start the development server with hot-reload
  * `-p, --port <number>` - Specify the port (default: 3000)
  * `-h, --host <host>` - Specify the host (default: localhost)
  * `-w, --watch` - Watch for file changes (default: true)

* `boilr build` - Build the Boilr application for production
  * `-c, --config <path>` - Specify the config file path

* `boilr start` - Start the production server
  * `-p, --port <number>` - Specify the port (default: 3000)
  * `-h, --host <host>` - Specify the host (default: localhost)

* `boilr --help` - Display help information
* `boilr --version` - Display version information

## Development

* `pnpm install` - Install dependencies
* `pnpm build` - Build the CLI
* `pnpm dev` - Watch for changes and rebuild
