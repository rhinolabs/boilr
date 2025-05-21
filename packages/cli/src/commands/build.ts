import type { Command } from 'commander';

export function registerBuildCommand(program: Command): void {
  program
    .command('build')
    .description('Build the Boilr application for production')
    .option('-c, --config <path>', 'specify the config file path')
    .action((options) => {
      console.log('Building application...');
      if (options.config) {
        console.log(`Using config file: ${options.config}`);
      }
    });
}
