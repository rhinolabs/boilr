import { FastifyInstance, FastifyListenOptions } from 'fastify';
import { NoboilConfig } from './config';

export interface NoboilInstance extends FastifyInstance {
  start: (options?: NoboilStartOptions) => Promise<{ app: FastifyInstance; address: string }>;
}

export interface NoboilStartOptions {
  port?: number;
  host?: string;
}

export function decorateServer(
  app: FastifyInstance, 
  config: NoboilConfig
): NoboilInstance {
  const noboilApp = app as NoboilInstance;
  
  noboilApp.start = async function(options: NoboilStartOptions = {}) {
    const port = options.port || config.server?.port || 3000;
    const host = options.host || config.server?.host || '0.0.0.0';
    
    const listenOptions: FastifyListenOptions = {
      port: port as number,
      host: host as string
    };
    
    try {
      const address = await this.listen(listenOptions);
      this.log.info(`Server started on ${address}`);
      return { app: this, address };
    } catch (err) {
      this.log.error(err);
      process.exit(1);
    }
  };
  
  return noboilApp;
}