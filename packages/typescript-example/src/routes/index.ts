import { type GetHandler, defineSchema } from "@rhinolabs/boilr";
import { z } from "zod";

// Schema for the root endpoint
export const schema = defineSchema({
  get: {
    tags: ["General"],
    response: {
      200: z.object({
        message: z.string(),
        api: z.string(),
        documentation: z.string(),
      }),
    },
  },
});

// GET / - Root endpoint
export const get: GetHandler<typeof schema> = async (request, reply) => {
  const serverAddress = `${request.protocol}://${request.hostname}`;

  return {
    message: "Welcome to the Todo CRUD API built with @rhinolabs/boilr",
    api: `${serverAddress}/api/todos`,
    documentation: `${serverAddress}/docs`,
  };
};
