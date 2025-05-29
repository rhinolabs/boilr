import { createApp } from "@rhinolabs/boilr";

// Create the application
const app = createApp({
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    host: process.env.HOST || "localhost",
    logger: {
      level: "info",
      transport: {
        target: "pino-pretty",
      },
    },
  },
  routes: {
    dir: "./src/routes",
    prefix: "/api",
  },
  plugins: {
    swagger: {
      openapi: {
        info: {
          title: "Todo CRUD API",
          description: "API for managing todos",
          version: "1.0.0",
        },
      },
    },
  },
});

// Start the server
app
  .start()
  .then(({ address }) => {
    console.log(`✨ Server running at ${address}`);
    console.log(`📚 API docs available at ${address}/docs`);
  })
  .catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
  });
