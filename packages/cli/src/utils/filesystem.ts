import fs from "node:fs/promises";
import path from "node:path";

/**
 * Project structure information
 */
export interface ProjectStructure {
  hasSrcDir: boolean;
  expectedOutput: {
    serverPath: string;
    routesPath: string;
    routeRefPath: string;
  };
}

/**
 * Check if a path exists
 * 
 * @param filePath Path to check
 * @returns True if the path exists, false otherwise
 */
export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Find the server file in the project
 */
export async function findServerFile(): Promise<string> {
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

/**
 * Find the compiled server file
 */
export async function findCompiledServerFile(): Promise<string | null> {
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

/**
 * Check if the project is built
 */
export async function isBuilt() {
  const serverFile = await findCompiledServerFile();
  return serverFile !== null;
}

/**
 * Check if the project uses pnpm
 */
export async function usesPnpm(): Promise<boolean> {
  try {
    // Check if pnpm-lock.yaml exists
    await fs.access(path.join(process.cwd(), "pnpm-lock.yaml"));
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect the project structure
 */
export async function detectProjectStructure(): Promise<ProjectStructure> {
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

/**
 * Copy a directory recursively
 * 
 * @param src Source directory
 * @param dest Destination directory
 */
export async function copyDir(src: string, dest: string) {
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
