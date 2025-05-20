import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export const schema = {
  get: {
    response: {
      200: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          email: z.string().email(),
        }),
      ),
    },
  },
};

export async function get(request: FastifyRequest, reply: FastifyReply) {
  return [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
  ];
}
