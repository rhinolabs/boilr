import { type GetHandler, defineSchema } from "@rhinolabs/boilr";
import { z } from "zod";

export const schema = defineSchema({
  get: {
    auth: false,
    tags: ["Public"],
    response: {
      200: z.object({
        message: z.string(),
      }),
    },
  },
});

export const get: GetHandler<typeof schema> = async (request, reply) => {
  return {
    message: "This is a public endpoint",
  };
};
