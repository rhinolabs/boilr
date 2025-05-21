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

      // Check if the build directory exists
      if (!fs.existsSync(distDir)) {
        console.error(`Error: Build directory not found: ${distDir}`);
        console.error('Make sure you have built the application using the "build" command.');
        process.exit(1);
      }

      // Check if server.js exists in the build directory
      if (!fs.existsSync(serverPath)) {
        console.error(`Error: server.js not found in build directory: ${serverPath}`);
        console.error('Make sure you have built the application using the "build" command.');
        process.exit(1);
      }

      // Set environment variables
      const env = {
        ...process.env,
        PORT: options.port,
        HOST: options.host,
        NODE_ENV: "production",
      };

      // Start the server
      const child = spawn("node", [serverPath], {
        stdio: "inherit",
        env,
        shell: true,
        cwd: distDir, // Run from the dist directory
      });

      // Handle process exit
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
