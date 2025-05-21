#!/usr/bin/env node
import * as p from "@clack/prompts";
import pc from "picocolors";
import { build, createProject, promptForProjectName, showHelp, start, startDev } from "./commands/index.js";

/**
 * Main entry point for the CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // If a specific command is passed, run it directly
  if (command) {
    await handleCommand(command, args.slice(1));
    return;
  }

  // Otherwise show interactive menu
  await showInteractiveMenu();
}

/**
 * Handle a specific command
 *
 * @param command Command to handle
 * @param args Command arguments
 */
async function handleCommand(command: string, args: string[]) {
  let result: unknown;

  switch (command) {
    case "dev":
      result = await startDev();
      break;
    case "build":
      await build();
      break;
    case "start":
      result = await start();
      break;
    case "new": {
      const projectName = args[0] || (await promptForProjectName());
      await createProject(projectName);
      break;
    }
    case "help":
      await showHelp();
      break;
    default:
      p.log.error(`Unknown command: ${pc.yellow(command)}`);
      await showHelp();
      process.exit(1);
  }

  return result;
}

/**
 * Show interactive menu for command selection
 */
async function showInteractiveMenu() {
  p.intro(pc.cyan("✨ Welcome to Boilr Framework CLI ✨"));

  const action = await p.select({
    message: "What do you want to do?",
    options: [
      { value: "dev", label: "Start development server", hint: "Run in watch mode with auto-reload" },
      { value: "build", label: "Build for production", hint: "Compile TypeScript and prepare assets" },
      { value: "start", label: "Start production server", hint: "Run the built application" },
      { value: "new", label: "Create new project", hint: "Scaffold a new Boilr application" },
      { value: "help", label: "Show help", hint: "Display CLI command documentation" },
      { value: "exit", label: "Exit", hint: "Close the CLI" },
    ],
  });

  if (p.isCancel(action)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  if (action === "exit") {
    p.outro("👋 Goodbye!");
    process.exit(0);
  }

  await handleCommand(action as string, []);
}

// Execute the main function
main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
