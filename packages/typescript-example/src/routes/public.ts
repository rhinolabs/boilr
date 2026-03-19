import { defineSchema, type GetHandler } from "@boilrjs/core";
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

export const get: GetHandler<typeof schema> = async (c) => {
  return c.json({ message: "This is a public endpoint" }, 200);
};
