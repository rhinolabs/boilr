#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";

// Main entry point
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // If a specific command is passed, run it directly
  if (command) {
    await handleCommand(command, args.slice(1));
    return;
  }

  // Otherwise show interactive menu
  await showInteractiveMenu();
}

// Handle specific commands
async function handleCommand(command: string, args: string[]) {
  switch (command) {
    case "dev":
      await startDev();
      break;
    case "build":
      await build();
      break;
    case "start":
      await start();
      break;
    case "new": {
      const projectName = args[0] || (await promptForProjectName());
      await createProject(projectName);
      break;
    }
    case "help":
      await showHelp();
      break;
    default:
      p.log.error(`Unknown command: ${pc.yellow(command)}`);
      await showHelp();
      process.exit(1);
  }
}

// Show interactive menu for command selection
async function showInteractiveMenu() {
  p.intro(pc.cyan("✨ Welcome to Boilr Framework CLI ✨"));

  const action = await p.select({
    message: "What do you want to do?",
    options: [
      { value: "dev", label: "Start development server", hint: "Run in watch mode with auto-reload" },
      { value: "build", label: "Build for production", hint: "Compile TypeScript and prepare assets" },
      { value: "start", label: "Start production server", hint: "Run the built application" },
      { value: "new", label: "Create new project", hint: "Scaffold a new Boilr application" },
      { value: "help", label: "Show help", hint: "Display CLI command documentation" },
      { value: "exit", label: "Exit", hint: "Close the CLI" },
    ],
  });

  if (p.isCancel(action)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  if (action === "exit") {
    p.outro("👋 Goodbye!");
    process.exit(0);
  }

  await handleCommand(action as string, []);
}

// Prompt for project name
async function promptForProjectName(): Promise<string> {
  const projectName = await p.text({
    message: "What is your project name?",
    placeholder: "my-boilr-app",
    validate: (value) => {
      if (!value) return "Project name is required";
      if (!/^[a-z0-9-_]+$/.test(value))
        return "Project name can only contain lowercase letters, numbers, hyphens, and underscores";
      return undefined;
    },
  });

  if (p.isCancel(projectName)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  return projectName;
}

// Show help information
async function showHelp() {
  p.note(
    [
      `${pc.cyan("Usage:")} ${pc.bold("boilr")} ${pc.yellow("<command>")} ${pc.gray("[options]")}`,
      "",
      `${pc.cyan("Commands:")}`,
      `  ${pc.yellow("dev")}       - Start development server with hot reloading`,
      `  ${pc.yellow("build")}     - Build the project for production`,
      `  ${pc.yellow("start")}     - Start the production server`,
      `  ${pc.yellow("new")}       - Create a new Boilr TypeScript project with ESM modules`,
      `  ${pc.yellow("help")}      - Show this help message`,
      "",
      `${pc.cyan("Examples:")}`,
      `  ${pc.gray("boilr dev")}`,
      `  ${pc.gray("boilr build")}`,
      `  ${pc.gray("boilr start")}`,
      `  ${pc.gray("boilr new my-api")}`,
    ].join("\n"),
    "Boilr CLI Help",
  );
}

// Development server functionality
async function startDev() {
  const s = p.spinner();
  s.start("Preparing development environment");

  try {
    // Find the server file
    const serverFile = await findServerFile();
    s.message(`Found server file: ${pc.cyan(serverFile)}`);

    // Create a temporary nodemon.json config file
    const nodemonConfig = {
      watch: ["src"],
      ext: "ts,json",
      ignore: ["src/**/*.spec.ts"],
      exec: "pnpm run build && pnpm run start",
    };

    const nodemonConfigPath = path.join(process.cwd(), "nodemon.json");

    // Write the nodemon config
    await fs.writeFile(nodemonConfigPath, JSON.stringify(nodemonConfig, null, 2));

    // Check if the project uses pnpm
    const usesPnpmProject = await usesPnpm();

    // Command to run nodemon
    let command: string | undefined;
    let args: string[] | undefined;

    if (usesPnpmProject) {
      s.message("Using pnpm with nodemon");
      command = "pnpm";
      args = ["exec", "nodemon"];
    } else {
      command = "npx";
      args = ["nodemon"];
    }

    s.stop(`Development server ready - ${pc.green("starting nodemon")}`);
    p.log.info("Starting development server...");
    p.log.info("Press Ctrl+C to stop");
    p.log.info("");

    // Run nodemon process
    const proc = spawn(command, args, {
      stdio: "inherit",
      shell: true,
    });

    proc.on("error", (err) => {
      p.log.error(`Failed to start development server: ${err}`);
      process.exit(1);
    });

    // Clean up nodemon.json when the process exits
    process.on("SIGINT", async () => {
      try {
        await fs.unlink(nodemonConfigPath);
      } catch (err) {
        // Ignore errors during cleanup
      }
      process.exit(0);
    });
  } catch (err) {
    s.stop(`${pc.red("Error:")} Failed to start development server`);
    p.log.error(err instanceof Error ? err.message : String(err));

    try {
      // Try to clean up the config file
      const nodemonConfigPath = path.join(process.cwd(), "nodemon.json");
      await fs.unlink(nodemonConfigPath);
    } catch {
      // Ignore errors during cleanup
    }

    process.exit(1);
  }
}

// Build functionality
async function build() {
  const s = p.spinner();
  s.start("Building project");

  const steps = [
    { name: "Compile TypeScript", done: false },
    { name: "Copy routes directory", done: false },
    { name: "Fix route paths", done: false },
  ];

  function updateSpinner() {
    const completedCount = steps.filter((step) => step.done).length;
    const progressBar = `[${completedCount}/${steps.length}]`;
    const pendingStep = steps.find((step) => !step.done);

    if (pendingStep) {
      s.message(`${progressBar} ${pendingStep.name}...`);
    }
  }

  try {
    updateSpinner();

    // 1. Run TypeScript compiler
    try {
      // First, try to run it from node_modules/.bin directly
      await runCommand("./node_modules/.bin/tsc", []);
    } catch (error) {
      // If that fails, try with pnpm if it's a pnpm project
      if (await usesPnpm()) {
        await runCommand("pnpm", ["exec", "tsc"]);
      } else {
        // Otherwise, try with npx
        await runCommand("npx", ["tsc"]);
      }
    }

    steps[0].done = true;
    updateSpinner();

    // 2. Copy routes directory to dist
    await copyRoutes();
    steps[1].done = true;
    updateSpinner();

    // 3. Fix route paths in compiled server files
    await fixRoutePaths();
    steps[2].done = true;

    s.stop(`${pc.green("✓")} Build completed successfully!`);
  } catch (err) {
    s.stop(`${pc.red("Error:")} Build failed`);
    p.log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

// Start production server
async function start() {
  const s = p.spinner();
  s.start("Starting production server");

  try {
    // Make sure the project is built
    if (!(await isBuilt())) {
      s.message("Project not built yet, building first...");
      await build();
    }

    // Find the compiled server file
    const serverFile = await findCompiledServerFile();

    if (!serverFile) {
      s.stop(`${pc.red("Error:")} Could not find compiled server file after build`);
      process.exit(1);
    }

    s.stop(`${pc.green("✓")} Starting server from ${pc.cyan(serverFile)}`);
    p.log.info("Starting production server...");
    p.log.info("Press Ctrl+C to stop");
    p.log.info("");

    // Start the Node.js server
    const proc = spawn("node", [serverFile], {
      stdio: "inherit",
      shell: true,
    });

    proc.on("error", (err) => {
      p.log.error(`Failed to start server: ${err}`);
      process.exit(1);
    });
  } catch (err) {
    s.stop(`${pc.red("Error:")} Failed to start server`);
    p.log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

// Create a new project
async function createProject(name: string) {
  const projectDir = path.join(process.cwd(), name);
  const s = p.spinner();

  try {
    // 1. Check if directory already exists
    try {
      await fs.access(projectDir);
      s.stop(`${pc.red("Error:")} Directory ${pc.yellow(name)} already exists`);
      return;
    } catch {
      // Directory doesn't exist, we can proceed
    }

    s.start(`Creating new Boilr TypeScript project with ESM modules: ${pc.cyan(name)}`);

    // 2. Create project directory
    await fs.mkdir(projectDir, { recursive: true });

    // Progress tracking
    const steps = [
      { name: "Create project structure", done: false },
      { name: "Initialize package.json", done: false },
      { name: "Create TypeScript config", done: false },
      { name: "Generate example files", done: false },
    ];

    function updateSpinner() {
      const completedCount = steps.filter((step) => step.done).length;
      const progressBar = `[${completedCount}/${steps.length}]`;
      const pendingStep = steps.find((step) => !step.done);

      if (pendingStep) {
        s.message(`${progressBar} ${pendingStep.name}...`);
      }
    }

    // 3. Create project structure
    updateSpinner();
    await createProjectStructure(projectDir);
    steps[0].done = true;
    updateSpinner();

    // 4. Initialize package.json with ESM
    await createPackageJson(projectDir, name);
    steps[1].done = true;
    updateSpinner();

    // 5. Create tsconfig.json for ESM
    await createTsConfig(projectDir);
    steps[2].done = true;
    updateSpinner();

    // 6. Create example TypeScript routes and server file
    await createExampleFiles(projectDir);
    steps[3].done = true;

    s.stop(`${pc.green("✓")} Project ${pc.cyan(name)} created successfully!`);

    p.note(
      [
        `${pc.cyan("Next steps:")}`,
        `  cd ${pc.yellow(name)}`,
        `  ${pc.yellow("npm install")}`,
        `  ${pc.yellow("npm run dev")}`,
      ].join("\n"),
      "Getting Started",
    );
  } catch (err) {
    s.stop(`${pc.red("Error:")} Failed to create project`);
    p.log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

// Helper functions

async function findServerFile(): Promise<string> {
  try {
    // Detect project structure
    const structure = await detectProjectStructure();

    // Preferred convention: src/server.ts (TypeScript only)
    const conventionalPath = "src/server.ts";

    // Check if conventional path exists first
    if (await pathExists(path.join(process.cwd(), conventionalPath))) {
      return conventionalPath;
    }

    // Alternative TypeScript paths to check
    const alternativePaths = ["server.ts", "src/app.ts", "app.ts", "src/index.ts", "index.ts"];

    // Check alternative paths
    for (const altPath of alternativePaths) {
      if (await pathExists(path.join(process.cwd(), altPath))) {
        return altPath;
      }
    }

    // If not found, use the convention but warn
    return conventionalPath;
  } catch (err) {
    // Default to convention in case of error
    return "src/server.ts";
  }
}

async function usesPnpm(): Promise<boolean> {
  try {
    // Check if pnpm-lock.yaml exists
    await fs.access(path.join(process.cwd(), "pnpm-lock.yaml"));
    return true;
  } catch {
    return false;
  }
}

async function runCommand(command: string, args: string[]) {
  // Check if we should use pnpm instead of npx
  if (command === "npx" && (await usesPnpm())) {
    // Convert the command from npx to pnpm
    // For TypeScript compilation, we can use 'pnpm exec tsc'
    if (args[0] === "tsc") {
      return new Promise<void>((resolve, reject) => {
        const proc = spawn("pnpm", ["exec", "tsc"], {
          stdio: "inherit",
          shell: true,
        });

        proc.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Command "pnpm exec tsc" failed with exit code ${code}`));
          }
        });

        proc.on("error", reject);
      });
    }
  }

  // Fall back to original command
  return new Promise<void>((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: "inherit",
      shell: true,
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command} ${args.join(" ")}" failed with exit code ${code}`));
      }
    });

    proc.on("error", reject);
  });
}

// Type for project structure info
interface ProjectStructure {
  hasSrcDir: boolean;
  expectedOutput: {
    serverPath: string;
    routesPath: string;
    routeRefPath: string;
  };
}

async function detectProjectStructure(): Promise<ProjectStructure> {
  try {
    // Default structure (with src/)
    const defaultStructure: ProjectStructure = {
      hasSrcDir: true,
      expectedOutput: {
        serverPath: "dist/src/server.js",
        routesPath: "dist/src/routes",
        routeRefPath: "./routes",
      },
    };

    // Try to read and parse tsconfig.json
    try {
      const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
      const tsconfigContent = await fs.readFile(tsconfigPath, "utf8");
      const tsconfig = JSON.parse(tsconfigContent);

      // Check rootDir configuration
      if (tsconfig.compilerOptions?.rootDir) {
        const rootDir = tsconfig.compilerOptions.rootDir.replace(/^\.\//, "");
        const outDir = (tsconfig.compilerOptions.outDir || "./dist").replace(/^\.\//, "");

        if (rootDir === "src") {
          // If rootDir is src/, the output will be flattened
          return {
            hasSrcDir: true,
            expectedOutput: {
              serverPath: `${outDir}/server.js`,
              routesPath: `${outDir}/routes`,
              routeRefPath: "./routes",
            },
          };
        }
      }
    } catch (err) {
      // If we can't read or parse tsconfig.json, use default
    }

    // Check if the src directory exists, even without tsconfig
    const hasSrc = await pathExists(path.join(process.cwd(), "src"));
    if (!hasSrc) {
      return {
        hasSrcDir: false,
        expectedOutput: {
          serverPath: "dist/server.js",
          routesPath: "dist/routes",
          routeRefPath: "./routes",
        },
      };
    }

    return defaultStructure;
  } catch (err) {
    // In case of any error, return default structure
    return {
      hasSrcDir: true,
      expectedOutput: {
        serverPath: "dist/src/server.js",
        routesPath: "dist/src/routes",
        routeRefPath: "./routes",
      },
    };
  }
}

async function copyRoutes() {
  try {
    // Detect project structure
    const structure = await detectProjectStructure();

    // Determine source and destination paths
    const routesDir = structure.hasSrcDir ? "src/routes" : "routes";
    const fullRoutesDir = path.join(process.cwd(), routesDir);
    const destDir = path.join(process.cwd(), structure.expectedOutput.routesPath);

    // Check if either routes directory exists
    if (!(await pathExists(fullRoutesDir))) {
      // If the primary route dir doesn't exist, check alternative
      const altRoutesDir = structure.hasSrcDir ? "routes" : "src/routes";
      const altFullRoutesDir = path.join(process.cwd(), altRoutesDir);

      if (await pathExists(altFullRoutesDir)) {
        // Create destination directory
        await fs.mkdir(destDir, { recursive: true });
        // Copy all files from routes to dist
        await copyDir(altFullRoutesDir, destDir);
        return;
      }
    }

    // Create destination directory
    await fs.mkdir(destDir, { recursive: true });

    // Copy all files from routes to dist
    await copyDir(fullRoutesDir, destDir);
  } catch (err) {
    throw new Error(`Failed to copy routes: ${err}`);
  }
}

async function copyDir(src: string, dest: string) {
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true });
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findCompiledServerFile(): Promise<string | null> {
  try {
    // Detect project structure
    const structure = await detectProjectStructure();
    const expectedPath = structure.expectedOutput.serverPath;

    // Make sure we're looking for .js files (compiled from .ts)
    const jsPath = expectedPath.endsWith(".js") ? expectedPath : `${expectedPath.replace(/\.ts$/, "")}.js`;

    // Check if expected path exists
    if (await pathExists(path.join(process.cwd(), jsPath))) {
      return jsPath;
    }

    // If not found at expected location, try alternative locations
    const alternativePaths = ["dist/src/server.js", "dist/server.js"].filter((p) => p !== jsPath); // Don't check the already checked path

    for (const altPath of alternativePaths) {
      if (await pathExists(path.join(process.cwd(), altPath))) {
        return altPath;
      }
    }

    return null;
  } catch (err) {
    return null;
  }
}

async function fixRoutePaths() {
  // Find the compiled server file
  const serverFile = await findCompiledServerFile();
  if (!serverFile) {
    return;
  }

  try {
    // Detect project structure to know correct route references
    const structure = await detectProjectStructure();
    const expectedRoutePath = structure.expectedOutput.routeRefPath;

    // Read the file content
    const filePath = path.join(process.cwd(), serverFile);
    const content = await fs.readFile(filePath, "utf8");

    // Possible route reference patterns to look for
    const routePatterns = [
      '"../routes"', // "../routes" (escaped in code)
      '"../routes"', // "../routes" (unescaped)
      '"../../routes"', // "../../routes" (deeper path)
      '"../src/routes"', // "../src/routes" (if routes in src)
    ];

    // Check if any patterns exist in the content
    let contentNeedsFixing = false;
    for (const pattern of routePatterns) {
      if (content.includes(pattern)) {
        contentNeedsFixing = true;
        break;
      }
    }

    if (contentNeedsFixing) {
      // Create fixed content by replacing all patterns with the expected route path
      let fixedContent = content;
      for (const pattern of routePatterns) {
        // We need to use string replacement (not regex) due to escaping complexities
        fixedContent = fixedContent.replace(pattern, `"${expectedRoutePath}"`);
      }

      // Write the fixed content back
      await fs.writeFile(filePath, fixedContent, "utf8");
    }

    // Make sure the routes are in the right place for the compiled server to find them
    const serverDir = path.dirname(path.join(process.cwd(), serverFile));
    const routesDir = path.join(serverDir, "routes");

    // If routes don't exist at the location the server expects, copy them there
    if (!(await pathExists(routesDir))) {
      const expectedRoutesPath = path.join(process.cwd(), structure.expectedOutput.routesPath);
      if (await pathExists(expectedRoutesPath)) {
        await fs.mkdir(routesDir, { recursive: true });
        await copyDir(expectedRoutesPath, routesDir);
      }
    }
  } catch (err) {
    throw new Error(`Failed to fix route paths: ${err}`);
  }
}

async function isBuilt() {
  const serverFile = await findCompiledServerFile();
  return serverFile !== null;
}

async function createProjectStructure(projectDir: string) {
  // Create directory structure - src/routes by convention
  await fs.mkdir(path.join(projectDir, "src"), { recursive: true });
  await fs.mkdir(path.join(projectDir, "src/routes"), { recursive: true });
  await fs.mkdir(path.join(projectDir, "src/routes/api"), { recursive: true });
}

async function createPackageJson(projectDir: string, name: string) {
  const packageJson = {
    name,
    version: "0.1.0",
    description: "A Boilr API project",
    type: "module", // Explicitly set as ESM
    scripts: {
      dev: "boilr dev",
      build: "boilr build",
      start: "boilr start",
      test: 'echo "Error: no test specified" && exit 1',
    },
    dependencies: {
      "@rhinolabs/boilr": "^0.1.0",
      fastify: "^5.0.0",
      "pino-pretty": "^13.0.0",
      zod: "^3.22.4",
    },
    devDependencies: {
      "@types/node": "^20.11.30",
      nodemon: "^3.0.1",
      typescript: "^5.4.5",
    },
    engines: {
      node: ">=18.0.0",
    },
  };

  await fs.writeFile(path.join(projectDir, "package.json"), JSON.stringify(packageJson, null, 2));
}

async function createTsConfig(projectDir: string) {
  // Create an ESM-optimized TypeScript config
  const tsConfig = {
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      strict: true,
      skipLibCheck: true,
      outDir: "./dist",
      rootDir: ".",
      sourceMap: true,
      declaration: true,
      resolveJsonModule: true,
    },
    include: ["src/**/*", "routes/**/*"],
    exclude: ["node_modules", "dist"],
  };

  await fs.writeFile(path.join(projectDir, "tsconfig.json"), JSON.stringify(tsConfig, null, 2));
}

async function createExampleFiles(projectDir: string) {
  // Create server.ts
  const serverTs = `
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '@rhinolabs/boilr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = createApp({
  server: {
    port: 3000,
    host: 'localhost',
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
      },
    },
  },
  routes: {
    dir: path.join(__dirname, '../routes'),
    prefix: '/api',
  },
  plugins: {
    swagger: {
      info: {
        title: 'Boilr API',
        description: 'API built with Boilr framework',
        version: '1.0.0',
      },
    },
  },
  validation: true,
});

app
  .start()
  .then(({ address }) => {
    console.log(\`Server is running on \${address}\`);
    console.log(\`API docs available at \${address}/docs\`);
  })
  .catch((err) => {
    console.error('Error starting server:', err);
    process.exit(1);
  });
`.trim();

  await fs.writeFile(path.join(projectDir, "src/server.ts"), serverTs);

  // Create index.ts route
  const indexRoute = `
import { type GetHandler, defineSchema } from '@rhinolabs/boilr';
import { z } from 'zod';

export const schema = defineSchema({
  get: {
    response: {
      200: z.object({
        message: z.string(),
        version: z.string(),
      }),
    },
  },
});

export const get: GetHandler<typeof schema> = async (request, reply) => {
  return {
    message: 'Welcome to Boilr API',
    version: '1.0.0',
  };
};
`.trim();

  await fs.writeFile(path.join(projectDir, "src/routes/api/index.ts"), indexRoute);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
