import { z } from "zod";

export const cartItemSchema = z.object({
  quantity: z.number(),
  productId: z.number(),
});

export const changeQuantitySchema = z.object({
  quantity: z.number(),
});
