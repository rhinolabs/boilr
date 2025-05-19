import { z } from 'zod';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

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
  request: FastifyRequest<{}, ZodTypeProvider>,
  reply: FastifyReply
) {
  return { message: 'Welcome to noboil!' };
}