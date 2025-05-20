// Use explicit imports with ESM
import { type GetHandler, type PostHandler, defineSchema } from "@rhinolabs/boilr";
import { z } from "zod";

// Define schema for endpoints
export const schema = defineSchema({
  get: {
    response: {
      200: z.array(
        z.object({
          id: z.number(),
          title: z.string(),
          completed: z.boolean(),
          createdAt: z.string().datetime(),
        }),
      ),
    },
  },
  post: {
    body: z.object({
      title: z.string().min(1, "Title is required"),
      completed: z.boolean().optional().default(false),
    }),
    response: {
      201: z.object({
        id: z.number(),
        title: z.string(),
        completed: z.boolean(),
        createdAt: z.string().datetime(),
      }),
    },
  },
});

// Create a Zod schema for the Todo type
export const TodoSchema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

// In-memory todo database
export const todos = [
  {
    id: 1,
    title: "Learn boilr framework",
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
export const get: GetHandler<typeof schema> = async (request, reply) => {
  return todos;
};

// POST /api/todos
export const post: PostHandler<typeof schema> = async (request, reply) => {
  // Body is properly typed with TypeScript inference
  const { title, completed = false } = request.body;

  const newTodo = {
    id: todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1,
    title,
    completed,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);

  reply.code(201);
  return newTodo;
};
