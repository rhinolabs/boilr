import fs from "node:fs/promises";
import path from "node:path";
import type { RouteInfo } from "../../types/file-routes.types.js";

interface ScanOptions {
  ignore?: RegExp[];
  extensions?: string[];
}

const DEFAULT_SCAN_OPTIONS: ScanOptions = {
  ignore: [/node_modules/, /\.(test|spec)\./, /\.d\.ts$/],
  extensions: [".js", ".cjs", ".mjs", ".ts"],
};

export async function scanDirectories(rootDir: string, options: ScanOptions = DEFAULT_SCAN_OPTIONS): Promise<string[]> {
  const absoluteRootDir = path.isAbsolute(rootDir) ? rootDir : path.join(process.cwd(), rootDir);

  try {
    await fs.access(absoluteRootDir);
  } catch (error) {
    throw new Error(`Directory ${absoluteRootDir} does not exist or is not accessible`);
  }

  const allFiles = await scanRecursive(absoluteRootDir, "", options);
  return prioritizeJsFiles(allFiles);
}

async function scanRecursive(currentDir: string, relativePath: string, options: ScanOptions): Promise<string[]> {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const routeFiles: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);

    if (options.ignore?.some((pattern) => pattern.test(entry.name))) {
      continue;
    }

    if (entry.name.startsWith(".") || entry.name.startsWith("_")) {
      continue;
    }

    if (entry.isDirectory()) {
      const newRelativePath = path.join(relativePath, entry.name);
      const subdirFiles = await scanRecursive(fullPath, newRelativePath, options);
      routeFiles.push(...subdirFiles);
    } else if (entry.isFile() && isRouteFile(entry.name, options.extensions)) {
      routeFiles.push(fullPath);
    }
  }

  return routeFiles;
}

function isRouteFile(filename: string, extensions: string[] = DEFAULT_SCAN_OPTIONS.extensions || []): boolean {
  const ext = path.extname(filename);
  return extensions.includes(ext);
}

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

    const routePath = pathTransform ? pathTransform(dirName, filename) : transformPathToRoute(dirName, filename);

    return {
      filePath,
      routePath,
      filename,
    };
  });
}

export function transformPathToRoute(dirPath: string, filename: string): string {
  let routeName = filename.replace(/\.(js|ts|cjs|mjs)$/, "");

  if (routeName === "index") {
    routeName = "";
  }

  routeName = handleDynamicSegments(routeName);

  const routeSegments = dirPath
    .split(path.sep)
    .filter(Boolean)
    .map((segment) => {
      if (/^\([^)]+\)$/.test(segment)) {
        return "";
      }
      return handleDynamicSegments(segment);
    })
    .filter(Boolean);

  if (routeName) {
    routeSegments.push(routeName);
  }

  const routePath = `/${routeSegments.join("/")}`;
  return routePath === "//" ? "/" : routePath;
}

export function handleDynamicSegments(segment: string): string {
  if (/^\[\[\.\.\.([^\]]+)\]\]$/.test(segment)) {
    return segment.replace(/^\[\[\.\.\.([^\]]+)\]\]$/, ":$1?*");
  }

  if (/^\[\.\.\.([^\]]+)\]$/.test(segment)) {
    return segment.replace(/^\[\.\.\.([^\]]+)\]$/, "*");
  }

  return segment.replace(/\[([^\]]+)\]/g, ":$1");
}

function prioritizeJsFiles(files: string[]): string[] {
  const nonDeclarationFiles = files.filter((file) => !file.endsWith(".d.ts"));

  const fileMap = new Map<string, string[]>();

  for (const file of nonDeclarationFiles) {
    const dir = path.dirname(file);
    const basename = path.basename(file);
    const baseWithoutExt = basename.replace(/\.(js|ts|mjs|cjs)$/, "");

    const key = path.join(dir, baseWithoutExt);

    if (!fileMap.has(key)) {
      fileMap.set(key, []);
    }

    fileMap.get(key)?.push(file);
  }

  const result: string[] = [];

  for (const [_, files] of fileMap.entries()) {
    if (files.length === 1) {
      result.push(files[0]);
    } else {
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
        const tsFile = files.find((f) => f.endsWith(".ts"));
        if (tsFile) {
          result.push(tsFile);
        }
      }
    }
  }

  return result;
}
