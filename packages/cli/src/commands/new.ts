import fs from "node:fs/promises";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";

/**
 * Create a new Boilr project
 * 
 * @param name The name of the project
 */
export async function createProject(name: string) {
  const projectDir = path.join(process.cwd(), name);
  const s = p.spinner();

  try {
    // 1. Check if directory already exists
    try {
      await fs.access(projectDir);
      s.stop(`${pc.red("Error:")} Directory ${pc.yellow(name)} already exists`);
      return;
    } catch {
      // Directory doesn't exist, we can proceed
    }

    s.start(`Creating new Boilr TypeScript project with ESM modules: ${pc.cyan(name)}`);

    // 2. Create project directory
    await fs.mkdir(projectDir, { recursive: true });

    // Progress tracking
    const steps = [
      { name: "Create project structure", done: false },
      { name: "Initialize package.json", done: false },
      { name: "Create TypeScript config", done: false },
      { name: "Generate example files", done: false },
    ];

    function updateSpinner() {
      const completedCount = steps.filter((step) => step.done).length;
      const progressBar = `[${completedCount}/${steps.length}]`;
      const pendingStep = steps.find((step) => !step.done);

      if (pendingStep) {
        s.message(`${progressBar} ${pendingStep.name}...`);
      }
    }

    // 3. Create project structure
    updateSpinner();
    await createProjectStructure(projectDir);
    steps[0].done = true;
    updateSpinner();

    // 4. Initialize package.json with ESM
    await createPackageJson(projectDir, name);
    steps[1].done = true;
    updateSpinner();

    // 5. Create tsconfig.json for ESM
    await createTsConfig(projectDir);
    steps[2].done = true;
    updateSpinner();

    // 6. Create example TypeScript routes and server file
    await createExampleFiles(projectDir);
    
    // 7. Create README.md 
    await createReadmeFile(projectDir, name);
    
    steps[3].done = true;

    s.stop(`${pc.green("✓")} Project ${pc.cyan(name)} created successfully!`);

    p.note(
      [
        `${pc.cyan("Next steps:")}`,
        `  cd ${pc.yellow(name)}`,
        `  ${pc.yellow("npm install")}`,
        `  ${pc.yellow("npm run dev")}`,
      ].join("\n"),
      "Getting Started",
    );
  } catch (err) {
    s.stop(`${pc.red("Error:")} Failed to create project`);
    p.log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

/**
 * Create the project directory structure
 * 
 * @param projectDir The project directory path
 */
async function createProjectStructure(projectDir: string) {
  // Create directory structure - src/routes by convention
  await fs.mkdir(path.join(projectDir, "src"), { recursive: true });
  await fs.mkdir(path.join(projectDir, "src/routes"), { recursive: true });
  await fs.mkdir(path.join(projectDir, "src/routes/api"), { recursive: true });
}

/**
 * Create package.json for the project
 * 
 * @param projectDir The project directory path
 * @param name The project name
 */
async function createPackageJson(projectDir: string, name: string) {
  // Read package.json template
  const packageJsonTemplateFile = path.join(__dirname, "../templates/package.json.template");
  let packageJsonContent = await fs.readFile(packageJsonTemplateFile, "utf-8");
  
  // Replace project name placeholder
  packageJsonContent = packageJsonContent.replace("<%PROJECT_NAME%>", name);
  
  // Write package.json
  await fs.writeFile(path.join(projectDir, "package.json"), packageJsonContent);
}

/**
 * Create tsconfig.json for the project
 * 
 * @param projectDir The project directory path
 */
async function createTsConfig(projectDir: string) {
  // Read tsconfig.json template
  const tsconfigTemplateFile = path.join(__dirname, "../templates/tsconfig.json.template");
  const tsconfigContent = await fs.readFile(tsconfigTemplateFile, "utf-8");
  
  // Write tsconfig.json
  await fs.writeFile(path.join(projectDir, "tsconfig.json"), tsconfigContent);
}

/**
 * Create README.md for the project
 * 
 * @param projectDir The project directory path
 * @param name The project name
 */
async function createReadmeFile(projectDir: string, name: string) {
  // Read README.md template
  const readmeTemplateFile = path.join(__dirname, "../templates/README.md.template");
  let readmeContent = await fs.readFile(readmeTemplateFile, "utf-8");
  
  // Replace project name placeholder
  readmeContent = readmeContent.replace("<%PROJECT_NAME%>", name);
  
  // Write README.md
  await fs.writeFile(path.join(projectDir, "README.md"), readmeContent);
}

/**
 * Create example files for the project
 * 
 * @param projectDir The project directory path
 */
async function createExampleFiles(projectDir: string) {
  // Read server.ts template
  const serverTemplateFile = path.join(__dirname, "../templates/server.ts.template");
  const serverTs = await fs.readFile(serverTemplateFile, "utf-8");

  // Create server.ts from template
  await fs.writeFile(path.join(projectDir, "src/server.ts"), serverTs);

  // Read index route template
  const indexRouteTemplateFile = path.join(__dirname, "../templates/index.ts.template");
  const indexRouteContent = await fs.readFile(indexRouteTemplateFile, "utf-8");

  // Create index.ts route from template
  await fs.writeFile(path.join(projectDir, "src/routes/api/index.ts"), indexRouteContent);
}

/**
 * Prompt for project name
 */
export async function promptForProjectName(): Promise<string> {
  const projectName = await p.text({
    message: "What is your project name?",
    placeholder: "my-boilr-app",
    validate: (value) => {
      if (!value) return "Project name is required";
      if (!/^[a-z0-9-_]+$/.test(value))
        return "Project name can only contain lowercase letters, numbers, hyphens, and underscores";
      return undefined;
    },
  });

  if (p.isCancel(projectName)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  return projectName;
}
