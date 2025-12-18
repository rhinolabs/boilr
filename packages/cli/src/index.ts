#!/usr/bin/env node
import { Command } from "commander";
import { registerCommands } from "./commands/index.js";

const program = new Command();
program.name("boilr").description("CLI tool for Boilr framework").version("0.1.0");

registerCommands(program);

program.parse();

console.warn(`
╔════════════════════════════════════════════════════════════╗
║  ⚠️  DEPRECATION WARNING                                   ║
║                                                            ║
║  @rhinolabs/boilr has been renamed to @boilrjs/core        ║
║                                                            ║
║  Please update: npm install -g @boilrjs/cli                ║
╚════════════════════════════════════════════════════════════╝
`);
