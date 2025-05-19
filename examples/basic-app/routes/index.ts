import { z } from 'zod';
import { FastifyRequest, FastifyReply } from 'fastify';

export const schema = {
  get: {
    response: {
      200: z.object({
        message: z.string()
      })
    }
  }
};

export async function get(
  request: FastifyRequest,
  reply: FastifyReply
) {
  return { message: 'Welcome to noboil!' };
}