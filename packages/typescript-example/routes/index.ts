import { type GetHandler, defineSchema } from "@rhinolabs/boilr";
import { z } from "zod";

// Schema for the root endpoint with type inference
export const schema = defineSchema({
  get: {
    response: {
      200: z.object({
        message: z.string(),
        api: z.string(),
        documentation: z.string(),
      }),
    },
  },
});

// Type for the response
type RootResponse = {
  message: string;
  api: string;
  documentation: string;
};

// GET / - Root endpoint with type safety
export const get: GetHandler<typeof schema> = async (request, reply): Promise<RootResponse> => {
  const serverAddress = `${request.protocol}://${request.hostname}`;

  return {
    message: "Welcome to the Todo CRUD API built with @rhinolabs/boilr",
    api: `${serverAddress}/api/todos`,
    documentation: `${serverAddress}/docs`,
  };
};
