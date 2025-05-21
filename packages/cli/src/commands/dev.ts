import type { Command } from 'commander';

export function registerDevCommand(program: Command): void {
  program
    .command('dev')
    .description('Start the development server with hot-reload')
    .option('-p, --port <number>', 'specify the port', '3000')
    .option('-h, --host <host>', 'specify the host', 'localhost')
    .option('-w, --watch', 'watch for file changes', true)
    .action((options) => {
      console.log(`Starting development server on ${options.host}:${options.port}...`);
      if (options.watch) {
        console.log('Watching for file changes...');
      }
    });
}
