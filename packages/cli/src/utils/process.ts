import { spawn } from "node:child_process";

/**
 * Run a shell command
 *
 * @param command Command to run
 * @param args Command arguments
 * @returns Promise that resolves when the command finishes
 */
export async function runCommand(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: "inherit",
      shell: true,
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command} ${args.join(" ")}" failed with exit code ${code}`));
      }
    });

    proc.on("error", reject);
  });
}
