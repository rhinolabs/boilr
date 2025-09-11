import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Command } from "commander";

export function registerTestCommand(program: Command): void {
  program
    .command("test")
    .description("Run tests using Vitest")
    .option("-w, --watch", "Run tests in watch mode")
    .option("-c, --coverage", "Generate coverage report")
    .option("--ui", "Open Vitest UI")
    .option("--reporter <reporter>", "Test reporter (default, verbose, json)")
    .option("--run", "Run tests once without watch mode")
    .action(async (options) => {
      const cwd = process.cwd();

      if (!hasTestDependencies(cwd)) {
        console.log("📦 Installing test dependencies...");
        await installTestDependencies(cwd);
      }

      const vitestCommand = buildVitestCommand(options);

      console.log(`🧪 Running tests: ${vitestCommand.join(" ")}`);

      const child = spawn(vitestCommand[0], vitestCommand.slice(1), {
        stdio: "inherit",
        cwd,
        env: { ...process.env, NODE_ENV: "test" }
      });

      child.on("exit", (code) => {
        process.exit(code ?? 0);
      });

      child.on("error", (error) => {
        console.error("Failed to start test runner:", error);
        process.exit(1);
      });
    });
}

function hasTestDependencies(cwd: string): boolean {
  const packageJsonPath = join(cwd, "package.json");
  if (!existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    return "vitest" in deps;
  } catch {
    return false;
  }
}

async function installTestDependencies(cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("pnpm", ["add", "-D", "vitest", "@rhinolabs/boilr-test"], {
      stdio: "inherit",
      cwd
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Installation failed with code ${code}`));
      }
    });

    child.on("error", reject);
  });
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function buildVitestCommand(options: any): string[] {
  const command = ["npx", "vitest"];

  if (options.watch && !options.run) {
    command.push("--watch");
  } else if (options.run) {
    command.push("run");
  }

  if (options.coverage) {
    command.push("--coverage");
  }

  if (options.ui) {
    command.push("--ui");
  }

  if (options.reporter) {
    command.push("--reporter", options.reporter);
  }

  return command;
}
