#!/usr/bin/env node
import { Command } from "commander";
import { registerCommands } from "./commands/index.js";

const program = new Command();
program.name("boilrjs").description("CLI tool for BoilrJs framework").version("0.1.0");

registerCommands(program);

program.parse();
