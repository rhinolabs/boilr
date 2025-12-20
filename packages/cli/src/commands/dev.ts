import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Command } from "commander";
import { loadEnvFiles } from "../utils/env.js";
import { log } from "../utils/logger.js";

export function registerDevCommand(program: Command): void {
  program
    .command("dev")
    .description("Start the development server with hot-reload")
    .option("-p, --port <number>", "specify the port", "3000")
    .option("-h, --host <host>", "specify the host", "localhost")
    .option("-w, --watch", "watch for file changes", true)
    .action((options) => {
      loadEnvFiles();

      log.dev(`Starting development server on ${log.url(`http://${options.host}:${options.port}`)}`);

      const serverPath = path.join(process.cwd(), "server.ts");

      if (!fs.existsSync(serverPath)) {
        log.errorWithSuggestion("server.ts file not found in the current directory", [
          "Make sure you are in a BoilrJs project directory",
          `Create a new project with ${log.command("boilrjs new my-app")}`,
          "Check if the file exists in current directory",
        ]);
        process.exit(1);
      }

      const env = {
        ...process.env,
        PORT: options.port,
        HOST: options.host,
      };

      const nodeArgs = ["--no-warnings"];

      const args = options.watch
        ? ["tsx", "watch", ...nodeArgs, serverPath] // Use tsx watch mode when watch is enabled
        : ["tsx", ...nodeArgs, serverPath]; // Use regular tsx execution otherwise

      if (options.watch) {
        log.dim("Watching for file changes...");
      }

      const child = spawn("npx", args, {
        stdio: "inherit",
        env,
        shell: true,
      });

      child.on("close", (code) => {
        if (code !== 0 && code !== null) {
          log.error(`Development server exited with code ${code}`);
          process.exit(code);
        }
      });

      // Handle SIGINT and SIGTERM to gracefully shutdown
      process.on("SIGINT", () => {
        log.info("Gracefully shutting down development server...");
        child.kill("SIGINT");
      });

      process.on("SIGTERM", () => {
        log.info("Gracefully shutting down development server...");
        child.kill("SIGTERM");
      });
    });
}
