import { type DeleteHandler, type GetHandler, type PutHandler, defineSchema } from "@rhinolabs/boilr";
import { z } from "zod";
import { TodoSchema, todos } from "./index";

// Define schema for todo API with ID parameter
export const schema = defineSchema({
  get: {
    params: z.object({
      id: z.string().transform((val) => Number.parseInt(val, 10)),
    }),
    response: {
      200: TodoSchema,
      404: z.object({
        error: z.string(),
        message: z.string(),
      }),
    },
  },
  put: {
    params: z.object({
      id: z.string().transform((val) => Number.parseInt(val, 10)),
    }),
    body: z.object({
      title: z.string().min(1).optional(),
      completed: z.boolean().optional(),
    }),
    response: {
      200: TodoSchema.extend({
        updatedAt: z.string().datetime(),
      }),
      404: z.object({
        error: z.string(),
        message: z.string(),
      }),
    },
  },
  delete: {
    params: z.object({
      id: z.string().transform((val) => Number.parseInt(val, 10)),
    }),
    response: {
      204: z.null(),
      404: z.object({
        error: z.string(),
        message: z.string(),
      }),
    },
  },
});

// GET /api/todos/:id - Get a single todo with type safety
export const get: GetHandler<typeof schema> = async (request, reply) => {
  const { id } = request.params; // id is typed as number due to transform

  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return reply.code(404).send({
      error: "Not Found",
      message: `Todo with id ${id} not found`,
    });
  }

  return todo;
};

// PUT /api/todos/:id - Update a todo with type safety
export const put: PutHandler<typeof schema> = async (request, reply) => {
  const { id } = request.params; // id is typed as number
  const updates = request.body;

  const todoIndex = todos.findIndex((t) => t.id === id);

  if (todoIndex === -1) {
    return reply.code(404).send({
      error: "Not Found",
      message: `Todo with id ${id} not found`,
    });
  }

  const updatedTodo = {
    ...todos[todoIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  todos[todoIndex] = updatedTodo;

  return updatedTodo;
};

// DELETE /api/todos/:id - Delete a todo with type safety
export const del: DeleteHandler<typeof schema> = async (request, reply) => {
  const { id } = request.params; // id is typed as number

  const todoIndex = todos.findIndex((t) => t.id === id);

  if (todoIndex === -1) {
    return reply.code(404).send({
      error: "Not Found",
      message: `Todo with id ${id} not found`,
    });
  }

  // Remove the todo from the array
  todos.splice(todoIndex, 1);

  return reply.code(204).send(null);
};
