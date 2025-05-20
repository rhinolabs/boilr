import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export const schema = {
  get: {
    response: {
      200: z.object({
        message: z.string(),
        version: z.string(),
        timestamp: z.number(),
      }),
    },
  },
};

export async function get(request: FastifyRequest, reply: FastifyReply) {
  return {
    message: "Welcome to noboil demo application!",
    version: "0.1.0",
    timestamp: Date.now(),
  };
}
