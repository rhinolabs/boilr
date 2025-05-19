import { createApp } from '../../src';
import path from 'path';
import { FastifyRequest, FastifyReply } from 'fastify';

const app = createApp({
  server: {
    port: 3000,
    logger: true
  },
  routes: {
    dir: path.join(__dirname, 'routes')
  },
  plugins: {
    swagger: true,
    cors: true
  },
  validation: true // Enable Zod validation
});

// Register custom middleware (optional)
app.registerMiddleware('timeLogger', async (request: FastifyRequest, reply: FastifyReply) => {
  request.log.info(`Request received at ${new Date().toISOString()}`);
});

app.start()
  .then(({ address }) => {
    console.log(`Server is running on ${address}`);
    console.log(`API docs available at ${address}/docs`);
  })
  .catch(err => {
    console.error('Error starting server:', err);
    process.exit(1);
  });