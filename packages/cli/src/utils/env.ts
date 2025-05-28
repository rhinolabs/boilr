import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { log } from "./logger.js";

/**
 * Load environment variables from .env files following a convention-based approach.
 * Loads files in this order (later files override earlier ones):
 * - .env
 * - .env.local
 * - .env.[NODE_ENV]
 * - .env.[NODE_ENV].local
 *
 * This matches Next.js conventions for maximum familiarity.
 */
export function loadEnvFiles(): void {
  const cwd = process.cwd();
  const nodeEnv = process.env.NODE_ENV || "development";

  // Define the order of env files to load (later files override earlier ones)
  const envFiles = [
    ".env",
    ".env.local",
    `.env.${nodeEnv}`,
    `.env.${nodeEnv}.local`,
  ];

  let loadedCount = 0;

  for (const envFile of envFiles) {
    const envPath = path.join(cwd, envFile);

    if (fs.existsSync(envPath)) {
      const result = config({ path: envPath, override: false });

      if (result.error) {
        log.warning(`Failed to load ${envFile}: ${result.error.message}`);
      } else {
        loadedCount++;
        log.dim(`Loaded environment variables from ${envFile}`);
      }
    }
  }

  if (loadedCount === 0) {
    log.dim("No .env files found - using system environment variables only");
  }
}
