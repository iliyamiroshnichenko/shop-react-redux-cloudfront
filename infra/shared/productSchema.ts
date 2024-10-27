import { z } from "zod";

export const productBodySchema = z.object({
  count: z.number(),
  price: z.number(),
  title: z.string(),
  description: z.string(),
});
