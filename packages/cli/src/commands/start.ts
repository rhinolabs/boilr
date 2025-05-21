import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Command } from "commander";

export function registerStartCommand(program: Command): void {
  program
    .command("start")
    .description("Start the production server")
    .option("-p, --port <number>", "specify the port", "3000")
    .option("-h, --host <host>", "specify the host", "localhost")
    .option("-d, --dir <path>", "specify the build directory", "dist")
    .action((options) => {
      console.log(`Starting production server on ${options.host}:${options.port}...`);

      const cwd = process.cwd();
      const distDir = path.resolve(cwd, options.dir);
      const serverPath = path.join(distDir, "server.js");

      if (!fs.existsSync(distDir)) {
        console.error(`Error: Build directory not found: ${distDir}`);
        console.error('Make sure you have built the application using the "build" command.');
        process.exit(1);
      }

      if (!fs.existsSync(serverPath)) {
        console.error(`Error: server.js not found in build directory: ${serverPath}`);
        console.error('Make sure you have built the application using the "build" command.');
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
          console.error(`Production server exited with code ${code}`);
          process.exit(code);
        }
      });

      // Handle SIGINT and SIGTERM to gracefully shutdown
      process.on("SIGINT", () => {
        console.log("\nGracefully shutting down production server...");
        child.kill("SIGINT");
      });

      process.on("SIGTERM", () => {
        console.log("\nGracefully shutting down production server...");
        child.kill("SIGTERM");
      });
    });
}
