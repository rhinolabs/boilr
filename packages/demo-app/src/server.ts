import path from "node:path";
import { createApp } from "@noboil/core";

console.log("Starting noboil demo application...");

// Create a noboil application instance
console.log("Routes directory:", path.join(__dirname, "../routes"));
try {
  const app = createApp({
    server: {
      port: 3001,
      logger: true,
    },
    routes: {
      dir: path.join(__dirname, "../routes"),
      prefix: "/api",
    },
    plugins: {
      helmet: false,
      swagger: false,
      cors: false,
      rateLimit: false,
    },
    validation: true,
  });
  console.log("Application created successfully");

  // Start the server
  app
    .start()
    .then(({ address }) => {
      console.log(`Server is running on ${address}`);
      console.log(`API docs available at ${address}/docs`);
    })
    .catch((err) => {
      console.error("Error starting server:", err);
      console.error(err.stack);
      process.exit(1);
    });
} catch (err) {
  console.error("Error during setup:", err);
  console.error(err instanceof Error ? err.stack : JSON.stringify(err));
  process.exit(1);
}
