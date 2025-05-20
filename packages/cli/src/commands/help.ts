import * as p from "@clack/prompts";
import pc from "picocolors";

/**
 * Show help information about available commands
 */
export async function showHelp() {
  p.note(
    [
      `${pc.cyan("Usage:")} ${pc.bold("boilr")} ${pc.yellow("<command>")} ${pc.gray("[options]")}`,
      "",
      `${pc.cyan("Commands:")}`,
      `  ${pc.yellow("dev")}       - Start development server with hot reloading`,
      `  ${pc.yellow("build")}     - Build the project for production`,
      `  ${pc.yellow("start")}     - Start the production server`,
      `  ${pc.yellow("new")}       - Create a new Boilr TypeScript project with ESM modules`,
      `  ${pc.yellow("help")}      - Show this help message`,
      "",
      `${pc.cyan("Examples:")}`,
      `  ${pc.gray("boilr dev")}`,
      `  ${pc.gray("boilr build")}`,
      `  ${pc.gray("boilr start")}`,
      `  ${pc.gray("boilr new my-api")}`,
    ].join("\n"),
    "Boilr CLI Help",
  );
}
