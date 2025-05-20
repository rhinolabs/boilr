#!/usr/bin/env node
/**
 * Script for updating package versions
 * Usage: node scripts/version.ts <package-name> <version>
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Get command line args
const [_node, _script, packageName, version] = process.argv;

// Validate inputs
if (!packageName || !version) {
  console.error("Usage: node scripts/version.ts <package-name> <version>");
  process.exit(1);
}

// Determine package.json path
const packagePath = join("packages", packageName, "package.json");

try {
  // Read and update package.json
  const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
  pkg.version = version;

  // Write back to file
  writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);

  console.log(`✅ Updated ${packageName} to version ${version}`);
} catch (error) {
  console.error(`❌ Error: Could not update ${packagePath}`);
  console.error(error);
  process.exit(1);
}
