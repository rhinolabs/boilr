import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Command } from "commander";
import { loadEnvFiles } from "../utils/env.js";
import { log } from "../utils/logger.js";

export function registerStartCommand(program: Command): void {
  program
    .command("start")
    .description("Start the production server")
    .option("-p, --port <number>", "specify the port", "3000")
    .option("-h, --host <host>", "specify the host", "localhost")
    .option("-d, --dir <path>", "specify the build directory", "dist")
    .action((options) => {
      const cwd = process.cwd();
      loadEnvFiles();

      log.server(`Starting production server on ${log.url(`http://${options.host}:${options.port}`)}`);

      const distDir = path.resolve(cwd, options.dir);
      const serverPath = path.join(distDir, "server.js");

      if (!fs.existsSync(distDir)) {
        log.errorWithSuggestion(`Build directory not found: ${log.path(distDir)}`, [
          `Run ${log.command("boilrjs build")} first to create production build`,
          "Check if you are in the correct project directory",
          "Verify the build was successful",
        ]);
        process.exit(1);
      }

      if (!fs.existsSync(serverPath)) {
        log.errorWithSuggestion(`server.js not found in build directory: ${log.path(serverPath)}`, [
          `Run ${log.command("boilrjs build")} first to create production build`,
          "Check if the build completed successfully",
          "Verify all dependencies are installed",
        ]);
        process.exit(1);
      }

      const env = {
        ...process.env,
        PORT: options.port,
        HOST: options.host,
        NODE_ENV: "production",
      };

      const child = spawn("node", [serverPath], {
        stdio: "inherit",
        env,
        shell: true,
        cwd: distDir, // Run from the dist directory
      });

      child.on("close", (code) => {
        if (code !== 0 && code !== null) {
          log.error(`Production server exited with code ${code}`);
          process.exit(code);
        }
      });

      // Handle SIGINT and SIGTERM to gracefully shutdown
      process.on("SIGINT", () => {
        log.info("Gracefully shutting down production server...");
        child.kill("SIGINT");
      });

      process.on("SIGTERM", () => {
        log.info("Gracefully shutting down production server...");
        child.kill("SIGTERM");
      });
    });
}
