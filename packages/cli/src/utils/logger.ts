import pc from "picocolors";

/**
 * Enhanced logger for Boilr CLI with colors and emojis
 */
export const log = {
  // Status messages
  success: (message: string) => console.log(pc.green(`✅ ${message}`)),
  error: (message: string) => console.log(pc.red(`❌ ${message}`)),
  warning: (message: string) => console.log(pc.yellow(`⚠️ ${message}`)),
  info: (message: string) => console.log(pc.blue(`ℹ️ ${message}`)),

  // Development specific
  dev: (message: string) => console.log(pc.magenta(`🔥 ${message}`)),
  build: (message: string) => console.log(pc.cyan(`🔨 ${message}`)),
  server: (message: string) => console.log(pc.green(`🚀 ${message}`)),

  // Progress and steps
  step: (step: number, message: string) => console.log(`${pc.blue(`${step}.`)} ${message}`),
  progress: (message: string) => console.log(pc.dim(`   ${message}...`)),

  // Utilities
  dim: (message: string) => console.log(pc.dim(message)),
  newline: () => console.log(""),

  // Formatters (return styled strings, don't console.log)
  command: (cmd: string) => pc.cyan(cmd),
  path: (path: string) => pc.dim(path),
  url: (url: string) => pc.underline(pc.cyan(url)),
  code: (code: string) => pc.gray(`\`${code}\``),

  // Multi-line helpers
  banner: (title: string) => {
    console.log("");
    console.log(pc.bold(pc.blue(`╭─ ${title} ─╮`)));
  },

  list: (items: string[]) => {
    for (const item of items) {
      console.log(`   • ${item}`);
    }
  },
  // Enhanced error messages with suggestions
  errorWithSuggestion: (error: string, suggestions: string[]) => {
    log.error(error);
    log.newline();
    log.info("💡 Try:");
    log.list(suggestions);
  },

  // Success with next steps
  successWithSteps: (message: string, steps: string[]) => {
    log.success(message);
    log.newline();
    log.info("Next steps:");
    steps.forEach((step, index) => {
      log.step(index + 1, step);
    });
  },
};
