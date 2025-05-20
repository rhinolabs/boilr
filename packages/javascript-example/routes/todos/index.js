import { z } from "zod";

// Define schema for todo API
export const schema = {
  get: {
    response: {
      200: z.array(
        z.object({
          id: z.number(),
          title: z.string(),
          completed: z.boolean(),
          createdAt: z.string().datetime()
        })
      )
    }
  },
  post: {
    body: z.object({
      title: z.string().min(1, "Title is required"),
      completed: z.boolean().optional().default(false)
    }),
    response: {
      201: z.object({
        id: z.number(),
        title: z.string(),
        completed: z.boolean(),
        createdAt: z.string().datetime()
      })
    }
  }
};

// In-memory todo database
let todos = [
  { 
    id: 1, 
    title: "Learn boilr framework", 
    completed: false, 
    createdAt: new Date().toISOString() 
  },
  { 
    id: 2, 
    title: "Build a CRUD API", 
    completed: false, 
    createdAt: new Date().toISOString() 
  }
];

// GET /api/todos - List all todos
export async function get(request, reply) {
  return todos;
}

// POST /api/todos - Create a new todo
export async function post(request, reply) {
  const { title, completed = false } = request.body;
  
  const newTodo = {
    id: todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1,
    title,
    completed,
    createdAt: new Date().toISOString()
  };
  
  todos.push(newTodo);
  
  reply.code(201);
  return newTodo;
}