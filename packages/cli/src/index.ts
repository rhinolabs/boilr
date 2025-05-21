#!/usr/bin/env node
import { Command } from 'commander';
import { registerCommands } from './commands/index.js';

const program = new Command();
program
  .name('boilr')
  .description('CLI tool for Boilr framework')
  .version('0.1.0');

registerCommands(program);

program.parse();
