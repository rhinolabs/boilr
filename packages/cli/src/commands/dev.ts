import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Command } from "commander";

export function registerDevCommand(program: Command): void {
  program
    .command("dev")
    .description("Start the development server with hot-reload")
    .option("-p, --port <number>", "specify the port", "3000")
    .option("-h, --host <host>", "specify the host", "localhost")
    .option("-w, --watch", "watch for file changes", true)
    .action((options) => {
      console.log(`Starting development server on ${options.host}:${options.port}...`);

      const cwd = process.cwd();
      const serverPath = path.join(cwd, "server.ts");

      if (!fs.existsSync(serverPath)) {
        console.error("Error: server.ts file not found in the current directory.");
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
        console.log("Watching for file changes...");
      }

      const child = spawn("npx", args, {
        stdio: "inherit",
        env,
        shell: true,
      });

      // Handle process exit
      child.on("close", (code) => {
        if (code !== 0 && code !== null) {
          console.error(`Development server exited with code ${code}`);
          process.exit(code);
        }
      });

      // Handle SIGINT and SIGTERM to gracefully shutdown
      process.on("SIGINT", () => {
        console.log("\nGracefully shutting down development server...");
        child.kill("SIGINT");
      });

      process.on("SIGTERM", () => {
        console.log("\nGracefully shutting down development server...");
        child.kill("SIGTERM");
      });
    });
}
