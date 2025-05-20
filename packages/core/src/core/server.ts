import type { FastifyInstance, FastifyListenOptions, FastifyReply, FastifyRequest } from "fastify";
import type { NoboilConfig } from "./config";

export interface NoboilInstance extends FastifyInstance {
  start: (options?: NoboilStartOptions) => Promise<{ app: FastifyInstance; address: string }>;
}

export interface NoboilStartOptions {
  port?: number;
  host?: string;
}

export function decorateServer(app: FastifyInstance, config: NoboilConfig): NoboilInstance {
  const noboilApp = app as NoboilInstance;

  noboilApp.start = async function (options: NoboilStartOptions = {}) {
    const port = options.port || config.server?.port || 3000;
    const host = options.host || config.server?.host || "0.0.0.0";

    console.log(`Starting server on ${host}:${port}`);

    const listenOptions: FastifyListenOptions = {
      port: port as number,
      host: host as string,
    };

    try {
      console.log(`Calling listen with options:`, listenOptions);
      const address = await this.listen(listenOptions);
      console.log(`Server started on ${address}`);
      this.log.info(`Server started on ${address}`);
      return { app: this, address };
    } catch (err) {
      console.error("Error in listen:", err);
      console.error(err instanceof Error ? err.stack : JSON.stringify(err));
      this.log.error(err);
      process.exit(1);
    }
  };

  return noboilApp;
}
