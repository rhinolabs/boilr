const { z } = require("zod");

// Define schema for todo API with ID parameter
exports.schema = {
  get: {
    params: z.object({
      id: z.string().transform((val) => Number.parseInt(val, 10)),
    }),
    response: {
      200: z.object({
        id: z.number(),
        title: z.string(),
        completed: z.boolean(),
        createdAt: z.string().datetime(),
      }),
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
      200: z.object({
        id: z.number(),
        title: z.string(),
        completed: z.boolean(),
        createdAt: z.string().datetime(),
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
};

// In-memory todo database (reference to the array in index.js)
// We'll get it from the other module
let todos;
try {
  todos = require('./index').todos;
} catch (err) {
  // Fallback if we can't import
  todos = [
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
}

// GET /api/todos/:id - Get a single todo
exports.get = async (request, reply) => {
  const { id } = request.params;

  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return reply.code(404).send({
      error: "Not Found",
      message: `Todo with id ${id} not found`,
    });
  }

  return todo;
};

// PUT /api/todos/:id - Update a todo
exports.put = async (request, reply) => {
  const { id } = request.params;
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

// DELETE /api/todos/:id - Delete a todo
exports.delete = async (request, reply) => {
  const { id } = request.params;

  const todoIndex = todos.findIndex((t) => t.id === id);

  if (todoIndex === -1) {
    return reply.code(404).send({
      error: "Not Found",
      message: `Todo with id ${id} not found`,
    });
  }

  // Remove the todo from the array
  todos.splice(todoIndex, 1);

  return reply.code(204).send();
};
