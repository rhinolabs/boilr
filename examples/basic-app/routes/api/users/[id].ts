import { z } from 'zod';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider } from '../../../../../src/validation';

// Define schemas with Zod
export const schema = {
  get: {
    params: z.object({
      id: z.string().transform(val => parseInt(val, 10))
    }),
    response: {
      200: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().email()
      }),
      404: z.object({
        error: z.string(),
        message: z.string()
      })
    }
  },

  put: {
    params: z.object({
      id: z.string().transform(val => parseInt(val, 10))
    }),
    body: z.object({
      name: z.string().optional(),
      email: z.string().email().optional()
    }),
    response: {
      200: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().email(),
        updated: z.boolean()
      }),
      404: z.object({
        error: z.string(),
        message: z.string()
      })
    }
  }
};

// Simulated database
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

// Type-safe request handlers
export async function get(
  request: FastifyRequest<{
    Params: z.infer<typeof schema.get.params>;
  }, ZodTypeProvider>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const user = users.find(u => u.id === id);

  if (!user) {
    return reply.code(404).send({
      error: 'Not Found',
      message: `User with id ${id} not found`
    });
  }

  return user;
}

export async function put(
  request: FastifyRequest<{
    Params: z.infer<typeof schema.put.params>;
    Body: z.infer<typeof schema.put.body>;
  }, ZodTypeProvider>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const userData = request.body;

  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return reply.code(404).send({
      error: 'Not Found',
      message: `User with id ${id} not found`
    });
  }

  // Update user
  users[userIndex] = {
    ...users[userIndex],
    ...userData
  };

  return {
    ...users[userIndex],
    updated: true
  };
}
