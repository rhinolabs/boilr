import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export const schema = {
  get: {
    response: {
      200: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          role: z.string(),
        }),
      ),
    },
  },
  post: {
    body: z.object({
      name: z.string().min(2),
      role: z.string().default("user"),
    }),
    response: {
      201: z.object({
        id: z.string(),
        name: z.string(),
        role: z.string(),
      }),
    },
  },
};

// Simulamos una base de datos de usuarios
const users: Record<string, { id: string; name: string; role: string }> = {
  "1": { id: "1", name: "Alice", role: "admin" },
  "2": { id: "2", name: "Bob", role: "user" },
  "3": { id: "3", name: "Charlie", role: "user" },
};

export async function get(request: FastifyRequest, reply: FastifyReply) {
  return Object.values(users);
}

export async function post(request: FastifyRequest<{ Body: { name: string; role?: string } }>, reply: FastifyReply) {
  const { name, role = "user" } = request.body;

  const id = String(Date.now());
  const newUser = {
    id,
    name,
    role,
  };

  users[id] = newUser;

  reply.status(201);
  return newUser;
}
