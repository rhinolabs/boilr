import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "@rhinolabs/boilr";

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting boilr Todo CRUD example...");

// Create a boilr application instance
console.log("Routes directory:", path.join(__dirname, "../routes"));
try {
  const app = createApp({
    server: {
      port: 3000,
      host: "localhost",
      logger: {
        level: "info",
        transport: {
          target: "pino-pretty"
        }
      }
    },
    routes: {
      dir: path.join(__dirname, "../routes"),
      prefix: "/api"
    },
    plugins: {
      swagger: {
        info: {
          title: "Todo CRUD API",
          description: "API for managing todos",
          version: "1.0.0"
        }
      }
    },
    validation: true
  });
  
  console.log("Application created successfully");

  // Start the server
  app.start()
    .then(({ address }) => {
      console.log(`Server is running on ${address}`);
      console.log(`API docs available at ${address}/docs`);
      console.log("");
      console.log("Available routes:");
      console.log("GET    /api/todos      - List all todos");
      console.log("GET    /api/todos/:id  - Get a single todo");
      console.log("POST   /api/todos      - Create a new todo");
      console.log("PUT    /api/todos/:id  - Update a todo");
      console.log("DELETE /api/todos/:id  - Delete a todo");
    })
    .catch(err => {
      console.error("Error starting server:", err);
      process.exit(1);
    });
} catch (err) {
  console.error("Error during setup:", err);
  process.exit(1);
}