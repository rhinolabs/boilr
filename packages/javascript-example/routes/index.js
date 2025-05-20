const { z } = require("zod");

// Schema for the root endpoint
exports.schema = {
  get: {
    response: {
      200: z.object({
        message: z.string(),
        api: z.string(),
        documentation: z.string(),
      }),
    },
  },
};

// GET / - Root endpoint
exports.get = async (request, reply) => {
  const serverAddress = `${request.protocol}://${request.hostname}`;

  return {
    message: "Welcome to the Todo CRUD API built with @rhinolabs/boilr",
    api: `${serverAddress}/api/todos`,
    documentation: `${serverAddress}/docs`,
  };
};
