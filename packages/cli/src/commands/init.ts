import type { Command } from 'commander';

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize a new Boilr project')
    .argument('[name]', 'project name')
    .option('-t, --template <template>', 'template to use', 'default')
    .option('--typescript', 'use TypeScript', true)
    .option('--skip-install', 'skip dependency installation', false)
    .action((name, options) => {
      const projectName = name || 'my-boilr-app';
      console.log(`Initializing new Boilr project: ${projectName}`);
      console.log(`Template: ${options.template}`);
      console.log(`TypeScript: ${options.typescript ? 'Yes' : 'No'}`);

      if (!options.skipInstall) {
        console.log('Installing dependencies...');
      }
    });
}
