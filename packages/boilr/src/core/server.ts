import type { FastifyInstance, FastifyPluginCallback } from "fastify";
import type { BoilrConfig, BoilrPluginOptions } from "./config.js";

export interface BoilrInstance extends FastifyInstance {
  start: (options?: BoilrStartOptions) => Promise<{ app: FastifyInstance; address: string }>;
  addPlugin: <T = unknown>(plugin: FastifyPluginCallback<BoilrPluginOptions<T>>, options?: T) => BoilrInstance;
}

export interface BoilrStartOptions {
  port?: number;
  host?: string;
}

export function decorateServer(app: FastifyInstance, config: BoilrConfig): BoilrInstance {
  const boilrApp = app as BoilrInstance;

  boilrApp.start = async function (options: BoilrStartOptions = {}) {
    const port = options.port || config.server?.port || 3000;
    const host = options.host || config.server?.host || "0.0.0.0";

    console.log(`Starting server on ${host}:${port}`);

    const listenOptions = { port, host };

    try {
      console.log("Calling listen with options:", listenOptions);
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

  boilrApp.addPlugin = function <T = unknown>(plugin: FastifyPluginCallback<BoilrPluginOptions<T>>, options?: T) {
    const enhancedOptions = {
      ...options,
      boilrConfig: config,
    } as BoilrPluginOptions<T>;

    this.register(plugin, enhancedOptions);
    return this;
  };

  return boilrApp;
}
