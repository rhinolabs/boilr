import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { findServerFile, pathExists, usesPnpm } from "../utils/filesystem.js";

/**
 * Start the development server with hot reloading
 */
export async function startDev() {
  const s = p.spinner();
  s.start("Preparing development environment");

  try {
    // Find the server file
    const serverFile = await findServerFile();
    s.message(`Found server file: ${pc.cyan(serverFile)}`);

    // Read nodemon.json template
    const nodemonTemplateFile = path.join(__dirname, "../templates/nodemon.json.template");
    const nodemonContent = await fs.readFile(nodemonTemplateFile, "utf-8");
    
    const nodemonConfigPath = path.join(process.cwd(), "nodemon.json");

    // Write the nodemon config
    await fs.writeFile(nodemonConfigPath, nodemonContent);

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
