import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Command } from "commander";
import { log } from "../utils/logger.js";

export function registerBuildCommand(program: Command): void {
  program
    .command("build")
    .description("Build the Boilr application for production")
    .option("-o, --outDir <path>", "specify the output directory", "dist")
    .option("--clean", "clean the output directory before building", false)
    .action((options) => {
      log.build("Building application for production...");

      const cwd = process.cwd();
      const serverPath = path.join(cwd, "server.ts");
      const outDir = path.resolve(cwd, options.outDir);

      if (!fs.existsSync(serverPath)) {
        log.errorWithSuggestion("server.ts file not found in the current directory", [
          "Make sure you are in a Boilr project directory",
          `Create a new project with ${log.command("boilr new my-app")}`,
          "Check TypeScript files exist",
        ]);
        process.exit(1);
      }

      if (options.clean && fs.existsSync(outDir)) {
        log.progress(`Cleaning output directory: ${log.path(outDir)}`);
        try {
          fs.rmSync(outDir, { recursive: true, force: true });
        } catch (error) {
          log.error(`Error cleaning output directory: ${(error as Error).message}`);
          process.exit(1);
        }
      }

      if (!fs.existsSync(outDir)) {
        try {
          fs.mkdirSync(outDir, { recursive: true });
        } catch (error) {
          log.error(`Error creating output directory: ${(error as Error).message}`);
          process.exit(1);
        }
      }

      const tscCommand = "tsc";
      const args = ["--outDir", options.outDir];

      log.progress("Compiling TypeScript");

      const child = spawn(tscCommand, args, {
        stdio: "inherit",
        shell: true,
      });

      child.on("close", (code) => {
        if (code !== 0) {
          log.errorWithSuggestion(`Build failed with code ${code}`, [
            "Check TypeScript compilation errors above",
            "Verify all imports have correct paths",
            `Run ${log.command("npm run dev")} to see detailed errors`,
          ]);
          process.exit(code || 1);
        } else {
          const tsconfigPath = path.join(cwd, "tsconfig.json");
          let hasPathWithAliases: boolean;

          try {
            const tsconfigContent = fs.readFileSync(tsconfigPath, "utf-8");
            const tsconfig = JSON.parse(tsconfigContent);
            hasPathWithAliases = tsconfig?.compilerOptions?.paths !== undefined;
          } catch (error) {
            hasPathWithAliases = false;
          }

          if (hasPathWithAliases) {
            log.progress("Resolving TypeScript path aliases");

            const tscAliasChild = spawn("tsc-alias", ["-p", "tsconfig.json"], {
              stdio: "inherit",
              shell: true,
            });

            tscAliasChild.on("close", (aliasCode) => {
              if (aliasCode !== 0) {
                log.errorWithSuggestion(`Path alias resolution failed with code ${aliasCode}`, [
                  "Check if your tsconfig.json has correct path aliases configured",
                  "Install tsc-alias: npm install --save-dev tsc-alias",
                ]);
                process.exit(aliasCode || 1);
              } else {
                log.successWithSteps("Build completed successfully", [
                  `Output files available in: ${log.path(outDir)}`,
                  `Run ${log.command("boilr start")} to start production server`,
                ]);
              }
            });
          } else {
            log.successWithSteps("Build completed successfully", [
              `Output files available in: ${log.path(outDir)}`,
              `Run ${log.command("boilr start")} to start production server`,
            ]);
          }
        }
      });
    });
}
