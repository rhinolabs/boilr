import fs from "node:fs/promises";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { copyDir, detectProjectStructure, findCompiledServerFile, pathExists, usesPnpm } from "../utils/filesystem.js";
import { runCommand } from "../utils/process.js";

/**
 * Build the project for production
 */
export async function build() {
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

/**
 * Copy routes to the dist directory
 */
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

/**
 * Fix route paths in compiled files
 */
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
