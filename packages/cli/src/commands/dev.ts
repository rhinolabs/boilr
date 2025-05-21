import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { findServerFile, usesPnpm } from "../utils/filesystem.js";

// Get __dirname equivalent in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Start the development server with hot reloading using nodemon with spawn
 */
export async function startDev() {
  const s = p.spinner();
  s.start("Preparing development environment");

  try {
    // Find the server file
    const serverFile = await findServerFile();
    s.message(`Found server file: ${pc.cyan(serverFile)}`);

    // Check if the project uses pnpm
    const usesPnpmProject = await usesPnpm();

    // Base nodemon arguments
    const nodemonArgs = [
      "--watch", "src",
      "--ext", "ts,json,js",
      "--ignore", "src/**/*.spec.ts",
      "--delay", "300"
    ];

    // Determine command to run
    const pmCmd = usesPnpmProject ? 'pnpm' : 'npm';

    // We need to properly quote the exec command for shell compatibility
    // This ensures that "build && start" is treated as a single command by nodemon
    const execCmd = `"${pmCmd} run build && ${pmCmd} run start"`;

    // Add exec command
    nodemonArgs.push('--exec', execCmd);

    s.stop(`Development server ready - ${pc.green("starting nodemon")}`);
    p.log.info("Starting development server with auto-reload...");
    p.log.info("Press Ctrl+C to stop");
    p.log.info("");

    let command: string;
    let args: string[];

    if (usesPnpmProject) {
      command = 'pnpm';
      args = ['exec', 'nodemon', ...nodemonArgs];
    } else {
      command = 'npx';
      args = ['nodemon', ...nodemonArgs];
    }

    // Run nodemon as a child process
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      detached: false
    });

    // Event handlers for the child process
    proc.on('error', (err: Error) => {
      p.log.error(`Failed to start development server: ${err.message}`);
      process.exit(1);
    });

    // Create a promise that resolves only when the process exits
    return new Promise((resolve) => {
      // When the process exits
      proc.on('exit', (code, signal) => {
        if (code !== 0) {
          p.log.error(`Development server exited with code ${code} and signal ${signal}`);
        }
        resolve(code ?? 0);
      });

      // Handle Ctrl+C
      process.once('SIGINT', () => {
        p.log.info('Stopping development server...');

        if (!proc.killed) {
          proc.kill('SIGINT');
        }

        // Give time for the process to clean up
        setTimeout(() => process.exit(0), 200);
      });

      // Handle other termination signals
      process.once('SIGTERM', () => {
        p.log.info('Stopping development server...');

        if (!proc.killed) {
          proc.kill('SIGTERM');
        }

        setTimeout(() => process.exit(0), 200);
      });
    });
  } catch (err) {
    s.stop(`${pc.red("Error:")} Failed to start development server`);
    p.log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
