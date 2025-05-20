import fs from "node:fs/promises";
import path from "node:path";
import type { RouteInfo } from "./types.js";

/**
 * Options for scanning directories
 */
interface ScanOptions {
  /**
   * List of file patterns to ignore
   */
  ignore?: RegExp[];

  /**
   * List of valid file extensions
   */
  extensions?: string[];
}

/**
 * Default options for scanning
 */
const DEFAULT_SCAN_OPTIONS: ScanOptions = {
  ignore: [/node_modules/, /\.(test|spec)\./, /\.d\.ts$/],
  extensions: [".js", ".cjs", ".mjs", ".ts"],
};

/**
 * Scans directories and files to find route files
 *
 * @param rootDir - The root directory to scan
 * @param options - Scan options
 * @returns List of route file paths
 */
export async function scanDirectories(rootDir: string, options: ScanOptions = DEFAULT_SCAN_OPTIONS): Promise<string[]> {
  const absoluteRootDir = path.isAbsolute(rootDir) ? rootDir : path.join(process.cwd(), rootDir);

  try {
    await fs.access(absoluteRootDir);
  } catch (error) {
    throw new Error(`Directory ${absoluteRootDir} does not exist or is not accessible`);
  }

  // First scan for all files
  const allFiles = await scanRecursive(absoluteRootDir, "", options);

  // Process the files to prioritize .js over .ts for the same base filename
  return prioritizeJsFiles(allFiles);
}

/**
 * Recursively scans directories and files
 *
 * @param currentDir - The current directory being scanned
 * @param relativePath - The relative path from the root directory
 * @param options - Scan options
 * @returns List of route file paths
 */
async function scanRecursive(currentDir: string, relativePath: string, options: ScanOptions): Promise<string[]> {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const routeFiles: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);

    // Skip files/directories that match ignore patterns
    if (options.ignore?.some((pattern) => pattern.test(entry.name))) {
      continue;
    }

    // Skip hidden files/directories
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) {
      continue;
    }

    if (entry.isDirectory()) {
      // For directories, update relative path and recurse
      // Skip directories starting with _ or .
      const newRelativePath = path.join(relativePath, entry.name);
      const subdirFiles = await scanRecursive(fullPath, newRelativePath, options);
      routeFiles.push(...subdirFiles);
    } else if (entry.isFile() && isRouteFile(entry.name, options.extensions)) {
      // For files, check if they're valid route files
      routeFiles.push(fullPath);
    }
  }

  return routeFiles;
}

/**
 * Checks if a file is a valid route file
 *
 * @param filename - The filename to check
 * @param extensions - List of valid file extensions
 * @returns Whether the file is a valid route file
 */
function isRouteFile(filename: string, extensions: string[] = DEFAULT_SCAN_OPTIONS.extensions || []): boolean {
  // Check if file has a valid extension
  const ext = path.extname(filename);
  return extensions.includes(ext);
}

/**
 * Extracts route information from file paths
 *
 * @param filePaths - List of file paths
 * @param rootDir - The root directory
 * @param pathTransform - Optional path transformation function
 * @returns List of route information
 */
export function extractRouteInfo(
  filePaths: string[],
  rootDir: string,
  pathTransform?: (path: string, filename: string) => string,
): RouteInfo[] {
  const absoluteRootDir = path.isAbsolute(rootDir) ? rootDir : path.join(process.cwd(), rootDir);

  return filePaths.map((filePath) => {
    const relativePath = path.relative(absoluteRootDir, filePath);
    const dirName = path.dirname(relativePath);
    const filename = path.basename(relativePath);

    // Default transformation if none provided
    const routePath = pathTransform ? pathTransform(dirName, filename) : transformPathToRoute(dirName, filename);

    return {
      filePath,
      routePath,
      filename,
    };
  });
}

/**
 * Transforms a file path to a route path
 *
 * @param dirPath - The directory path
 * @param filename - The filename
 * @returns The route path
 */
export function transformPathToRoute(dirPath: string, filename: string): string {
  // Remove extension
  let routeName = filename.replace(/\.(js|ts|cjs|mjs)$/, "");

  // Handle index files
  if (routeName === "index") {
    routeName = "";
  }

  // Handle dynamic parameters: [id] -> :id
  routeName = handleDynamicSegments(routeName);

  // Handle route grouping: (group) directories don't affect route path
  const routeSegments = dirPath
    .split(path.sep)
    .filter(Boolean)
    .map((segment) => {
      // Skip group directories: (group) -> ''
      if (/^\([^)]+\)$/.test(segment)) {
        return "";
      }
      return handleDynamicSegments(segment);
    })
    .filter(Boolean);

  if (routeName) {
    routeSegments.push(routeName);
  }

  // Combine all parts and normalize
  const routePath = `/${routeSegments.join("/")}`;
  return routePath === "//" ? "/" : routePath;
}

/**
 * Handles dynamic segments in route paths
 *
 * @param segment - The path segment
 * @returns The transformed segment
 */
export function handleDynamicSegments(segment: string): string {
  // Handle optional catch-all: [[...slug]] -> :slug?*
  if (/^\[\[\.\.\.([^\]]+)\]\]$/.test(segment)) {
    return segment.replace(/^\[\[\.\.\.([^\]]+)\]\]$/, ":$1?*");
  }

  // Handle catch-all: [...slug] -> *
  if (/^\[\.\.\.([^\]]+)\]$/.test(segment)) {
    return segment.replace(/^\[\.\.\.([^\]]+)\]$/, "*");
  }

  // Handle dynamic parameters: [id] -> :id
  return segment.replace(/\[([^\]]+)\]/g, ":$1");
}

/**
 * Prioritizes .js files over .ts files for the same base name
 *
 * @param files - List of file paths
 * @returns Filtered list with .js prioritized over .ts
 */
function prioritizeJsFiles(files: string[]): string[] {
  // First, filter out .d.ts files completely
  const nonDeclarationFiles = files.filter((file) => !file.endsWith(".d.ts"));

  // Create a map to track files by their "base name" (without extension)
  const fileMap = new Map<string, string[]>();

  for (const file of nonDeclarationFiles) {
    // Get the directory and base name without extension
    const dir = path.dirname(file);
    const basename = path.basename(file);
    // Remove extension (.js, .ts, etc.)
    const baseWithoutExt = basename.replace(/\.(js|ts|mjs|cjs)$/, "");

    // Key is the directory + base name without extension
    const key = path.join(dir, baseWithoutExt);

    if (!fileMap.has(key)) {
      fileMap.set(key, []);
    }

    fileMap.get(key)?.push(file);
  }

  // For each group of files with the same base name, prioritize .js over .ts
  const result: string[] = [];

  for (const [_, files] of fileMap.entries()) {
    if (files.length === 1) {
      // If only one file exists, include it
      result.push(files[0]);
    } else {
      // If multiple files exist, prioritize by extension
      // Order: .js, .mjs, .cjs, .ts
      const jsFile = files.find((f) => f.endsWith(".js"));
      const mjsFile = files.find((f) => f.endsWith(".mjs"));
      const cjsFile = files.find((f) => f.endsWith(".cjs"));

      if (jsFile) {
        result.push(jsFile);
      } else if (mjsFile) {
        result.push(mjsFile);
      } else if (cjsFile) {
        result.push(cjsFile);
      } else {
        // If no JS version exists, use the TS version
        const tsFile = files.find((f) => f.endsWith(".ts"));
        if (tsFile) {
          result.push(tsFile);
        }
      }
    }
  }

  return result;
}
