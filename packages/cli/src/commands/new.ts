import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Command } from "commander";
import { log } from "../utils/logger.js";

function processTemplateContent(content: string, variables: Record<string, string>): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return variables[variable] || match;
  });
}

function processTemplateFiles(source: string, destination: string, variables: Record<string, string>) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);

    let destFileName = entry.name;
    if (destFileName.endsWith(".template")) {
      destFileName = destFileName.substring(0, destFileName.length - 9);
    }

    const destinationPath = path.join(destination, destFileName);

    if (entry.isDirectory()) {
      processTemplateFiles(sourcePath, destinationPath, variables);
    } else {
      const content = fs.readFileSync(sourcePath, "utf8");
      const processedContent = processTemplateContent(content, variables);
      fs.writeFileSync(destinationPath, processedContent);
    }
  }
}

export function registerNewCommand(program: Command): void {
  program
    .command("new")
    .description("Create a new BoilrJs project")
    .argument("[name]", "project name")
    .option("-t, --template <template>", "template to use", "default")
    .option("--typescript", "use TypeScript", true)
    .option("--skip-install", "skip dependency installation", false)
    .action((name, options) => {
      const projectName = name || "my-boilr-app";
      log.banner(`Creating new BoilrJs project: ${projectName}`);

      const cwd = process.cwd();
      const projectPath = path.join(cwd, projectName);

      if (fs.existsSync(projectPath)) {
        log.errorWithSuggestion(`Directory ${projectName} already exists`, [
          "Choose a different project name",
          "Remove the existing directory first",
          "Use a different location",
        ]);
        process.exit(1);
      }

      fs.mkdirSync(projectPath, { recursive: true });

      const currentFilePath = fileURLToPath(import.meta.url);
      const currentDirPath = path.dirname(currentFilePath);

      let templatesRootPath = path.resolve(currentDirPath, "../templates");
      let templatePath = path.join(templatesRootPath, options.template);

      if (!fs.existsSync(templatePath)) {
        templatesRootPath = path.resolve(currentDirPath, "../../src/templates");
        templatePath = path.join(templatesRootPath, options.template);
      }

      if (!fs.existsSync(templatePath)) {
        log.errorWithSuggestion(`Template "${options.template}" not found`, [
          `Use the default template: ${log.command("boilrjs new my-app")}`,
          "Check available templates",
          "Verify the template name is correct",
        ]);
        process.exit(1);
      }

      try {
        const templateVariables = {
          projectName,
          typescript: options.typescript ? "true" : "false",
        };

        log.step(1, "Copying and processing template files...");
        processTemplateFiles(templatePath, projectPath, templateVariables);

        log.step(2, "Project files created successfully.");

        // Install dependencies
        if (!options.skipInstall) {
          log.step(3, "Installing dependencies...");
          log.progress("Installing dependencies");

          const child = spawn("npm", ["install"], {
            stdio: "inherit",
            shell: true,
            cwd: projectPath,
          });

          child.on("close", (code) => {
            if (code !== 0) {
              log.errorWithSuggestion(`npm install failed with code ${code}`, [
                `cd ${projectName}`,
                log.command("npm install"),
                "Check your internet connection",
              ]);
            } else {
              log.newline();
              log.successWithSteps("🎉 Your new BoilrJs project is ready!", [
                `cd ${log.command(projectName)}`,
                log.command("npm run dev"),
              ]);
              log.newline();
              log.dim("Happy coding! 🚀");
            }
          });
        } else {
          log.newline();
          log.successWithSteps("🎉 Your new BoilrJs project is ready!", [
            `cd ${log.command(projectName)}`,
            log.command("npm install"),
            log.command("npm run dev"),
          ]);
          log.newline();
          log.dim("Happy coding! 🚀");
        }
      } catch (error) {
        log.errorWithSuggestion(`Error initializing project: ${(error as Error).message}`, [
          "Check if you have write permissions",
          "Try again with a different project name",
          "Ensure you have a stable internet connection",
        ]);
        process.exit(1);
      }
    });
}
