import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Command } from "commander";

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

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Initialize a new Boilr project")
    .argument("[name]", "project name")
    .option("-t, --template <template>", "template to use", "default")
    .option("--typescript", "use TypeScript", true)
    .option("--skip-install", "skip dependency installation", false)
    .action((name, options) => {
      const projectName = name || "my-boilr-app";
      console.log(`Initializing new Boilr project: ${projectName}`);

      const cwd = process.cwd();
      const projectPath = path.join(cwd, projectName);

      if (fs.existsSync(projectPath)) {
        console.error(`Error: Directory ${projectName} already exists. Please choose a different project name.`);
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
        console.error(`Error: Template "${options.template}" not found.`);
        process.exit(1);
      }

      try {
        const templateVariables = {
          projectName,
          typescript: options.typescript ? "true" : "false",
        };

        console.log("Copying and processing template files...");
        processTemplateFiles(templatePath, projectPath, templateVariables);

        console.log("Project files created successfully.");

        // Install dependencies
        if (!options.skipInstall) {
          console.log("Installing dependencies...");

          const child = spawn("npm", ["install"], {
            stdio: "inherit",
            shell: true,
            cwd: projectPath,
          });

          child.on("close", (code) => {
            if (code !== 0) {
              console.error(`Error: npm install failed with code ${code}.`);
              console.log("You can install dependencies manually by running:");
              console.log(`  cd ${projectName}`);
              console.log("  npm install");
            } else {
              console.log("Dependencies installed successfully.");
              console.log("\nYour new Boilr project is ready! 🚀\n");
              console.log("To get started:");
              console.log(`  cd ${projectName}`);
              console.log("  npm run dev");
            }
          });
        } else {
          console.log("Dependencies installation skipped.");
          console.log("\nYour new Boilr project is ready! 🚀\n");
          console.log("To get started:");
          console.log(`  cd ${projectName}`);
          console.log("  npm install");
          console.log("  npm run dev");
        }
      } catch (error) {
        console.error(`Error initializing project: ${(error as Error).message}`);
        process.exit(1);
      }
    });
}
