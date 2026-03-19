import { defineSchema, type GetHandler, type PostHandler } from "@boilrjs/core";
import { z } from "zod";

// Define schema for endpoints
export const schema = defineSchema({
  get: {
    tags: ["To-do"],
    response: {
      200: z.array(
        z.object({
          id: z.number(),
          title: z.string(),
          completed: z.boolean(),
          createdAt: z.iso.datetime(),
        }),
      ),
    },
  },
  post: {
    tags: ["To-do"],
    body: z.object({
      title: z.string().min(1, "Title is required"),
      completed: z.boolean().optional().default(false),
    }),
    response: {
      201: z.object({
        id: z.number(),
        title: z.string(),
        completed: z.boolean(),
        createdAt: z.iso.datetime(),
      }),
    },
  },
});

// Create a Zod schema for the Todo type
export const TodoSchema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().optional(),
});

// In-memory todo database
export const todos = [
  {
    id: 1,
    title: "Learn BoilrJs framework",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Build a CRUD API",
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

// GET /api/todos
export const get: GetHandler<typeof schema> = async (c) => {
  return c.json(todos, 200);
};

// POST /api/todos
export const post: PostHandler<typeof schema> = async (c) => {
  const { title, completed = false } = c.req.valid("json");

  const newTodo = {
    id: todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1,
    title,
    completed,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);

  return c.json(newTodo, 201);
};
