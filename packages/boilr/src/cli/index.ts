#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    showHelp();
    return;
  }

  const cwd = process.cwd();

  switch (command) {
    case 'dev':
      await startDev();
      break;
    case 'build':
      await build();
      break;
    case 'start':
      await start();
      break;
    case 'new':
      await createProject(args[1] || 'my-boilr-app');
      break;
    case 'help':
    default:
      showHelp();
  }
}

function showHelp() {
  console.log(`
Boilr CLI - A command line tool for Boilr framework

Usage:
  boilr <command> [options]

Commands:
  dev       - Start development server with hot reloading
  build     - Build the project for production
  start     - Start the production server
  new       - Create a new Boilr TypeScript project with ESM modules
  help      - Show this help message

Examples:
  boilr dev
  boilr build
  boilr start
  boilr new my-api
  `);
}

// Function to find server file based on project structure - TypeScript only
async function findServerFile(): Promise<string> {
  try {
    // Detect project structure
    const structure = await detectProjectStructure();

    // Preferred convention: src/server.ts (TypeScript only)
    const conventionalPath = 'src/server.ts';

    // Check if conventional path exists first
    if (await pathExists(path.join(process.cwd(), conventionalPath))) {
      console.log(`Found server file at conventional location: ${conventionalPath}`);
      return conventionalPath;
    }

    // Alternative TypeScript paths to check
    const alternativePaths = [
      'server.ts',
      'src/app.ts',
      'app.ts',
      'src/index.ts',
      'index.ts'
    ];

    // Check alternative paths
    for (const altPath of alternativePaths) {
      if (await pathExists(path.join(process.cwd(), altPath))) {
        console.log(`Found server file at alternative location: ${altPath}`);
        return altPath;
      }
    }

    // If not found, use the convention but warn
    console.log(`No TypeScript server file found. Using convention: ${conventionalPath}`);
    return conventionalPath;
  } catch (err) {
    // Default to convention in case of error
    console.log('⚠️ Error finding server file, using convention: src/server.ts');
    return 'src/server.ts';
  }
}

async function startDev() {
  console.log('Starting development server...');

  // Find the server file
  const serverFile = await findServerFile();

  // Check if the project uses pnpm
  const usesPnpmProject = await usesPnpm();

  // Command and args to run - always using ESM
  let command = 'npx';
  let args = [
    'ts-node-dev',
    '--esm', // Always use ESM mode
    '--respawn',
    '--transpile-only',
    serverFile
  ];

  // If the project uses pnpm, use 'pnpm exec' instead
  if (usesPnpmProject) {
    console.log('Using pnpm instead of npx...');
    command = 'pnpm';
    args = ['exec', 'ts-node-dev', '--esm', '--respawn', '--transpile-only', serverFile];
  }

  console.log('Starting TypeScript with ESM modules...');

  // Run ts-node-dev with proper configuration
  const proc = spawn(command, args, {
    stdio: 'inherit',
    shell: true
  });

  proc.on('error', (err) => {
    console.error('Failed to start development server:', err);
    process.exit(1);
  });
}

async function build() {
  console.log('Building project...');

  try {
    // 1. Run TypeScript compiler
    // Try various approaches to run the TypeScript compiler
    try {
      // First, try to run it from node_modules/.bin directly
      await runCommand('./node_modules/.bin/tsc', []);
    } catch (error) {
      // If that fails, try with pnpm if it's a pnpm project
      if (await usesPnpm()) {
        await runCommand('pnpm', ['exec', 'tsc']);
      } else {
        // Otherwise, try with npx
        await runCommand('npx', ['tsc']);
      }
    }

    // 2. Copy routes directory to dist
    await copyRoutes();

    // 3. Fix route paths in compiled server files
    await fixRoutePaths();

    console.log('✅ Build completed successfully!');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

async function start() {
  console.log('Starting production server...');

  // Make sure the project is built
  if (!await isBuilt()) {
    console.log('⚠️ Project not built yet, building first...');
    await build();
  }

  // Find the compiled server file
  const serverFile = await findCompiledServerFile();

  if (!serverFile) {
    console.error('Error: Could not find compiled server file after build.');
    process.exit(1);
  }

  // Start the Node.js server
  const proc = spawn('node', [serverFile], {
    stdio: 'inherit',
    shell: true
  });

  proc.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

async function createProject(name: string) {
  const projectDir = path.join(process.cwd(), name);

  try {
    // 1. Check if directory already exists
    try {
      await fs.access(projectDir);
      console.error(`❌ Error: Directory ${name} already exists.`);
      return;
    } catch {
      // Directory doesn't exist, we can proceed
    }

    console.log(`Creating new Boilr TypeScript project with ESM modules: ${name}`);

    // 2. Create project directory
    await fs.mkdir(projectDir, { recursive: true });

    // 3. Create project structure
    await createProjectStructure(projectDir);

    // 4. Initialize package.json with ESM
    await createPackageJson(projectDir, name);

    // 5. Create tsconfig.json for ESM
    await createTsConfig(projectDir);

    // 6. Create example TypeScript routes and server file
    await createExampleFiles(projectDir);

    console.log(`
✅ TypeScript+ESM project created successfully!

Next steps:
  cd ${name}
  npm install
  npm run dev
    `);
  } catch (err) {
    console.error('Failed to create project:', err);
    process.exit(1);
  }
}

// Helper to detect if the project uses pnpm
async function usesPnpm(): Promise<boolean> {
  try {
    // Check if pnpm-lock.yaml exists
    await fs.access(path.join(process.cwd(), 'pnpm-lock.yaml'));
    return true;
  } catch {
    return false;
  }
}

async function runCommand(command: string, args: string[]) {
  // Check if we should use pnpm instead of npx
  if (command === 'npx' && (await usesPnpm())) {
    // Convert the command from npx to pnpm
    console.log('Using pnpm instead of npx...');

    // For TypeScript compilation, we can use 'pnpm exec tsc'
    if (args[0] === 'tsc') {
      return new Promise<void>((resolve, reject) => {
        const proc = spawn('pnpm', ['exec', 'tsc'], {
          stdio: 'inherit',
          shell: true
        });

        proc.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Command "pnpm exec tsc" failed with exit code ${code}`));
          }
        });

        proc.on('error', reject);
      });
    } else {
      // For other commands, use 'pnpm exec <command>'
      return new Promise<void>((resolve, reject) => {
        const proc = spawn('pnpm', ['exec', ...args], {
          stdio: 'inherit',
          shell: true
        });

        proc.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Command "pnpm exec ${args.join(' ')}" failed with exit code ${code}`));
          }
        });

        proc.on('error', reject);
      });
    }
  }

  // Fall back to original command
  return new Promise<void>((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command} ${args.join(' ')}" failed with exit code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

async function copyRoutes() {
  try {
    // Detect project structure
    const structure = await detectProjectStructure();

    // Determine source and destination paths
    const routesDir = structure.hasSrcDir ? 'src/routes' : 'routes';
    const fullRoutesDir = path.join(process.cwd(), routesDir);
    const destDir = path.join(process.cwd(), structure.expectedOutput.routesPath);

    // Check if either routes directory exists
    if (!(await pathExists(fullRoutesDir))) {
      // If the primary route dir doesn't exist, check alternative
      const altRoutesDir = structure.hasSrcDir ? 'routes' : 'src/routes';
      const altFullRoutesDir = path.join(process.cwd(), altRoutesDir);

      if (await pathExists(altFullRoutesDir)) {
        // Found routes in alternative location
        console.log(`Found routes at alternative location: ${altRoutesDir}`);
        // Create destination directory
        await fs.mkdir(destDir, { recursive: true });
        // Copy all files from routes to dist
        await copyDir(altFullRoutesDir, destDir);
        console.log(`📁 Routes copied from ${altRoutesDir} to ${structure.expectedOutput.routesPath}`);
        return;
      }
    }

    // Create destination directory
    await fs.mkdir(destDir, { recursive: true });

    // Copy all files from routes to dist
    await copyDir(fullRoutesDir, destDir);

    console.log(`📁 Routes copied from ${routesDir} to ${structure.expectedOutput.routesPath}`);
  } catch (err) {
    console.log('⚠️ Error copying routes:', err);
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

// Type for project structure info
interface ProjectStructure {
  // Whether the project uses src/ directory structure
  hasSrcDir: boolean;
  // Expected output structure based on tsconfig
  expectedOutput: {
    serverPath: string;        // Where server.js will be compiled to
    routesPath: string;        // Where routes will be copied to
    routeRefPath: string;      // How the server should reference routes
  };
}

// Function to detect the project structure by analyzing tsconfig.json
async function detectProjectStructure(): Promise<ProjectStructure> {
  try {
    // Default structure (with src/)
    const defaultStructure: ProjectStructure = {
      hasSrcDir: true,
      expectedOutput: {
        serverPath: 'dist/src/server.js',
        routesPath: 'dist/src/routes',
        routeRefPath: './routes'
      }
    };

    // Try to read and parse tsconfig.json
    try {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      const tsconfigContent = await fs.readFile(tsconfigPath, 'utf8');
      const tsconfig = JSON.parse(tsconfigContent);

      // Check rootDir configuration
      if (tsconfig.compilerOptions?.rootDir) {
        const rootDir = tsconfig.compilerOptions.rootDir.replace(/^\.\//, '');
        const outDir = (tsconfig.compilerOptions.outDir || './dist').replace(/^\.\//, '');

        if (rootDir === 'src') {
          // If rootDir is src/, the output will be flattened
          return {
            hasSrcDir: true,
            expectedOutput: {
              serverPath: `${outDir}/server.js`,
              routesPath: `${outDir}/routes`,
              routeRefPath: './routes'
            }
          };
        }
      }
    } catch (err) {
      // If we can't read or parse tsconfig.json, use default
      console.log('⚠️ Could not read or parse tsconfig.json, using default structure');
    }

    // Check if the src directory exists, even without tsconfig
    const hasSrc = await pathExists(path.join(process.cwd(), 'src'));
    if (!hasSrc) {
      return {
        hasSrcDir: false,
        expectedOutput: {
          serverPath: 'dist/server.js',
          routesPath: 'dist/routes',
          routeRefPath: './routes'
        }
      };
    }

    return defaultStructure;
  } catch (err) {
    // In case of any error, return default structure
    console.log('⚠️ Error detecting project structure:', err);
    return {
      hasSrcDir: true,
      expectedOutput: {
        serverPath: 'dist/src/server.js',
        routesPath: 'dist/src/routes',
        routeRefPath: './routes'
      }
    };
  }
}

// Function to find compiled server file based on project structure (ESM TypeScript)
async function findCompiledServerFile(): Promise<string | null> {
  try {
    // Detect project structure
    const structure = await detectProjectStructure();
    const expectedPath = structure.expectedOutput.serverPath;

    // Make sure we're looking for .js files (compiled from .ts)
    const jsPath = expectedPath.endsWith('.js') ? expectedPath : `${expectedPath.replace(/\.ts$/, '')}.js`;

    // Check if expected path exists
    if (await pathExists(path.join(process.cwd(), jsPath))) {
      console.log(`Found compiled server file at expected location: ${jsPath}`);
      return jsPath;
    }

    // If not found at expected location, try alternative locations
    const alternativePaths = [
      'dist/src/server.js',
      'dist/server.js'
    ].filter(p => p !== jsPath); // Don't check the already checked path

    for (const altPath of alternativePaths) {
      if (await pathExists(path.join(process.cwd(), altPath))) {
        console.log(`Found compiled server file at alternative location: ${altPath}`);
        return altPath;
      }
    }

    console.log('⚠️ Compiled server file not found at any expected location');
    return null;
  } catch (err) {
    console.log('⚠️ Error finding compiled server file:', err);
    return null;
  }
}

// Function to fix route paths in compiled server files for src/routes convention
async function fixRoutePaths() {
  // Find the compiled server file
  const serverFile = await findCompiledServerFile();
  if (!serverFile) {
    console.log('⚠️ No compiled server file found, skipping route path fix');
    return;
  }

  try {
    // Detect project structure to know correct route references
    const structure = await detectProjectStructure();
    const expectedRoutePath = structure.expectedOutput.routeRefPath;

    // Read the file content
    const filePath = path.join(process.cwd(), serverFile);
    const content = await fs.readFile(filePath, 'utf8');

    // Possible route reference patterns to look for
    const routePatterns = [
      '"..\/routes"',    // "../routes" (escaped in code)
      '"../routes"',      // "../routes" (unescaped)
      '"../../routes"',   // "../../routes" (deeper path)
      '"../src/routes"'   // "../src/routes" (if routes in src)
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
      await fs.writeFile(filePath, fixedContent, 'utf8');
      console.log(`🔧 Fixed route paths in server file to use "${expectedRoutePath}"`);
    }

    // Make sure the routes are in the right place for the compiled server to find them
    const serverDir = path.dirname(path.join(process.cwd(), serverFile));
    const routesDir = path.join(serverDir, 'routes');

    // If routes don't exist at the location the server expects, copy them there
    if (!(await pathExists(routesDir))) {
      const expectedRoutesPath = path.join(process.cwd(), structure.expectedOutput.routesPath);
      if (await pathExists(expectedRoutesPath)) {
        await fs.mkdir(routesDir, { recursive: true });
        await copyDir(expectedRoutesPath, routesDir);
        console.log(`📋 Copied routes from ${structure.expectedOutput.routesPath} to server's expected location`);
      }
    }
  } catch (err) {
    console.log('⚠️ Error fixing route paths:', err);
  }
}

// Helper to check if a path exists
async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isBuilt() {
  const serverFile = await findCompiledServerFile();
  return serverFile !== null;
}

async function createProjectStructure(projectDir: string) {
  // Create directory structure - src/routes by convention
  await fs.mkdir(path.join(projectDir, 'src'), { recursive: true });
  await fs.mkdir(path.join(projectDir, 'src/routes'), { recursive: true });
  await fs.mkdir(path.join(projectDir, 'src/routes/api'), { recursive: true });
}

async function createPackageJson(projectDir: string, name: string) {
  const packageJson = {
    name,
    version: '0.1.0',
    description: 'A Boilr API project',
    type: 'module', // Explicitly set as ESM
    scripts: {
      dev: 'boilr dev',
      build: 'boilr build',
      start: 'boilr start',
      test: 'echo "Error: no test specified" && exit 1'
    },
    dependencies: {
      '@rhinolabs/boilr': '^0.1.0',
      'fastify': '^5.0.0',
      'pino-pretty': '^13.0.0',
      'zod': '^3.22.4'
    },
    devDependencies: {
      '@types/node': '^20.11.30',
      'ts-node-dev': '^2.0.0',
      'typescript': '^5.4.5'
    },
    engines: {
      "node": ">=18.0.0"
    }
  };

  await fs.writeFile(
    path.join(projectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

async function createTsConfig(projectDir: string) {
  // Create an ESM-optimized TypeScript config
  const tsConfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',     // Required for ESM
      moduleResolution: 'NodeNext', // Required for ESM
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      strict: true,
      skipLibCheck: true,
      outDir: './dist',
      rootDir: '.',
      sourceMap: true,
      declaration: true,
      resolveJsonModule: true
    },
    include: ['src/**/*', 'routes/**/*'],
    exclude: ['node_modules', 'dist']
  };

  await fs.writeFile(
    path.join(projectDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );
}

async function createExampleFiles(projectDir: string) {
  // Create server.ts
  const serverTs = `
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '@rhinolabs/boilr';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a boilr application instance
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

// Start the server
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

  await fs.writeFile(
    path.join(projectDir, 'src/server.ts'),
    serverTs
  );

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

  await fs.writeFile(
    path.join(projectDir, 'src/routes/api/index.ts'),
    indexRoute
  );
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
