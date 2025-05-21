import type { Command } from "commander";
import { registerBuildCommand } from "./build.js";
import { registerDevCommand } from "./dev.js";
import { registerNewCommand } from "./new.js";
import { registerStartCommand } from "./start.js";

export function registerCommands(program: Command): void {
  registerBuildCommand(program);
  registerDevCommand(program);
  registerStartCommand(program);
  registerNewCommand(program);
}
