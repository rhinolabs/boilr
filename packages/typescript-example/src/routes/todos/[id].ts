import { type DeleteHandler, type GetHandler, NotFoundException, type PutHandler, defineSchema } from "@boilrjs/core";
import { z } from "zod";
import { TodoSchema, todos } from "./index.js"; // Ensure .js extension for ESM imports

// Define schema for endpoints
export const schema = defineSchema({
  get: {
    tags: ["To-do"],
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
    tags: ["To-do"],
    params: z.object({
      id: z.string().transform((val) => Number.parseInt(val, 10)),
    }),
    body: z.object({
      title: z.string().min(1).optional(),
      completed: z.boolean().optional(),
    }),
    response: {
      200: TodoSchema.extend({
        updatedAt: z.iso.datetime(),
      }),
      404: z.object({
        error: z.string(),
        message: z.string(),
      }),
    },
  },
  delete: {
    tags: ["To-do"],
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

// GET /api/todos/:id
export const get: GetHandler<typeof schema> = async (request) => {
  const { id } = request.params;

  const todo = todos.find((t: { id: number }) => t.id === id);

  if (!todo) {
    throw new NotFoundException(`Todo with id ${id} not found`);
  }

  return todo;
};

// PUT /api/todos/:id
export const put: PutHandler<typeof schema> = async (request) => {
  const { id } = request.params;
  const updates = request.body;

  const todoIndex = todos.findIndex((t: { id: number }) => t.id === id);

  if (todoIndex === -1) {
    throw new NotFoundException(`Todo with id ${id} not found`);
  }

  const updatedTodo = {
    ...todos[todoIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  todos[todoIndex] = updatedTodo;

  return updatedTodo;
};

// DELETE /api/todos/:id
export const del: DeleteHandler<typeof schema> = async (request, reply) => {
  const { id } = request.params;

  const todoIndex = todos.findIndex((t: { id: number }) => t.id === id);

  if (todoIndex === -1) {
    throw new NotFoundException(`Todo with id ${id} not found`);
  }

  // Remove the todo from the array
  todos.splice(todoIndex, 1);

  return reply.code(204).send(null);
};
