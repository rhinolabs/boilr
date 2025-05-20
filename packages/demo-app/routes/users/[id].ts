import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export const schema = {
  get: {
    params: z.object({
      id: z.string().min(1),
    }),
    response: {
      200: z.object({
        id: z.string(),
        name: z.string(),
        role: z.string(),
      }),
      404: z.object({
        error: z.string(),
        message: z.string(),
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

export async function get(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const { id } = request.params;

  const user = users[id];

  if (!user) {
    reply.status(404);
    return {
      error: "Not Found",
      message: `User with id ${id} not found`,
    };
  }

  return user;
}
