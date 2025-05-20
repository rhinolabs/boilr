import { z } from "zod";

// Define schema for todo API with ID parameter
export const schema = {
  get: {
    params: z.object({
      id: z.string().transform(val => parseInt(val, 10))
    }),
    response: {
      200: z.object({
        id: z.number(),
        title: z.string(),
        completed: z.boolean(),
        createdAt: z.string().datetime()
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
      title: z.string().min(1).optional(),
      completed: z.boolean().optional()
    }),
    response: {
      200: z.object({
        id: z.number(),
        title: z.string(),
        completed: z.boolean(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
      }),
      404: z.object({
        error: z.string(),
        message: z.string()
      })
    }
  },
  delete: {
    params: z.object({
      id: z.string().transform(val => parseInt(val, 10))
    }),
    response: {
      204: z.null(),
      404: z.object({
        error: z.string(),
        message: z.string()
      })
    }
  }
};

// In-memory todo database (reference)
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

// GET /api/todos/:id - Get a single todo
export async function get(request, reply) {
  const { id } = request.params;
  
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return reply.code(404).send({
      error: "Not Found",
      message: `Todo with id ${id} not found`
    });
  }
  
  return todo;
}

// PUT /api/todos/:id - Update a todo
export async function put(request, reply) {
  const { id } = request.params;
  const updates = request.body;
  
  const todoIndex = todos.findIndex(t => t.id === id);
  
  if (todoIndex === -1) {
    return reply.code(404).send({
      error: "Not Found",
      message: `Todo with id ${id} not found`
    });
  }
  
  const updatedTodo = {
    ...todos[todoIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  todos[todoIndex] = updatedTodo;
  
  return updatedTodo;
}

// DELETE /api/todos/:id - Delete a todo
export async function delete_(request, reply) {
  const { id } = request.params;
  
  const todoIndex = todos.findIndex(t => t.id === id);
  
  if (todoIndex === -1) {
    return reply.code(404).send({
      error: "Not Found",
      message: `Todo with id ${id} not found`
    });
  }
  
  // Remove the todo from the array
  todos.splice(todoIndex, 1);
  
  return reply.code(204).send();
}