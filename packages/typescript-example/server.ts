import { createApp, extractApiKey, extractBearerToken } from "@rhinolabs/boilr";

async function verifyJwtToken(token: string) {
  if (token === "valid-jwt") {
    return { userId: "123", name: "John Doe", roles: ["admin"] };
  }
  throw new Error("Invalid JWT token");
}

async function verifyApiKey(apiKey: string) {
  const validKeys: Record<string, any> = {
    "api-key-123": { clientId: "client1", name: "Test Client" },
  };
  const client = validKeys[apiKey];
  if (!client) throw new Error("Invalid API key");
  return client;
}

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
  auth: {
    methods: [
      {
        name: "bearer",
        type: "bearer",
        validator: async (request) => {
          const token = extractBearerToken(request);
          return await verifyJwtToken(token!);
        },
      },
      {
        name: "apiKey",
        type: "apiKey",
        options: { key: "x-api-key", location: "header" },
        validator: async (request) => {
          const apiKey = extractApiKey(request, "header", "x-api-key");
          return await verifyApiKey(apiKey!);
        },
      },
    ],
  },
  plugins: {
    swagger: {
      openapi: {
        info: {
          title: "Todo CRUD API with Authentication",
          description: "API for managing todos with auth system",
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
