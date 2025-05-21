import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Command } from "commander";

export function registerBuildCommand(program: Command): void {
  program
    .command("build")
    .description("Build the Boilr application for production")
    .option("-o, --outDir <path>", "specify the output directory", "dist")
    .option("--clean", "clean the output directory before building", false)
    .action((options) => {
      console.log("Building application for production...");

      const cwd = process.cwd();
      const serverPath = path.join(cwd, "server.ts");
      const outDir = path.resolve(cwd, options.outDir);

      if (!fs.existsSync(serverPath)) {
        console.error("Error: server.ts file not found in the current directory.");
        process.exit(1);
      }

      if (options.clean && fs.existsSync(outDir)) {
        console.log(`Cleaning output directory: ${outDir}`);
        try {
          fs.rmSync(outDir, { recursive: true, force: true });
          console.log("Output directory cleaned successfully.");
        } catch (error) {
          console.error(`Error cleaning output directory: ${(error as Error).message}`);
          process.exit(1);
        }
      }

      if (!fs.existsSync(outDir)) {
        try {
          fs.mkdirSync(outDir, { recursive: true });
        } catch (error) {
          console.error(`Error creating output directory: ${(error as Error).message}`);
          process.exit(1);
        }
      }

      const tscCommand = "tsc";
      const args = ["--outDir", options.outDir];

      console.log(`Building with command: ${tscCommand} ${args.join(" ")}`);

      const child = spawn(tscCommand, args, {
        stdio: "inherit",
        shell: true,
      });

      child.on("close", (code) => {
        if (code !== 0) {
          console.error(`Build failed with code ${code}`);
          process.exit(code || 1);
        } else {
          console.log("Build completed successfully.");
          console.log(`Output files available in: ${outDir}`);
        }
      });
    });
}
