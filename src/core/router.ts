import { FastifyInstance, FastifyPluginOptions, RouteOptions } from 'fastify';
import fp from 'fastify-plugin';
import autoload from '@fastify/autoload';
import path from 'path';

export const routerPlugin = fp(async function(
  fastify: FastifyInstance, 
  options: FastifyPluginOptions
) {
  const routeOptions = {
    dir: path.join(process.cwd(), options.routesDir || './routes'),
    options: {
      prefix: options.prefix || ''
    }
  };
  
  fastify.register(autoload, {
    ...routeOptions,
    autoHooks: true,
    cascadeHooks: true,
    routeParams: true,
    ignorePattern: /spec|test|__test__|node_modules/,
    dirNameRoutePrefix: true,
    routeNameCharacterLimit: 50,
    pathToRoute: getRoutePath
  });
});

function getRoutePath(path: string): string {
  if (path.endsWith('/index')) {
    return path.slice(0, -6) || '/';
  }
  
  return path.replace(/\[([^\]]+)\]/g, ':$1');
}