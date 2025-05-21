import type { Command } from 'commander';

export function registerStartCommand(program: Command): void {
  program
    .command('start')
    .description('Start the production server')
    .option('-p, --port <number>', 'specify the port', '3000')
    .option('-h, --host <host>', 'specify the host', 'localhost')
    .action((options) => {
      console.log(`Starting production server on ${options.host}:${options.port}...`);
    });
}
