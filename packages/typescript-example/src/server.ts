import { createApp } from "@rhinolabs/boilr";

// Create the application
const app = createApp({
  server: {
    port: 3000,
    host: "localhost",
    logger: {
      level: "info",
      transport: {
        target: "pino-pretty",
      },
    },
  },
  routes: {
    dir: "./routes",
    prefix: "/api",
  },
  plugins: {
    swagger: {
      info: {
        title: "Todo CRUD API",
        description: "API for managing todos",
        version: "1.0.0",
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
