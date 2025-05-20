import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "@rhinolabs/boilr";

// Get the current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting boilr Todo CRUD example...");

// Create a boilr application instance
console.log("Routes directory:", path.join(__dirname, "../routes"));
try {
  const app = createApp({
    server: {
      port: 3003,
      host: "localhost",
      logger: {
        level: "info",
        transport: {
          target: "pino-pretty",
        },
      },
    },
    routes: {
      dir: path.join(__dirname, "../routes"),
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
      process.exit(1);
    });
} catch (err) {
  console.error("Error during setup:", err);
  process.exit(1);
}
