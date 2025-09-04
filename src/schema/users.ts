import { z } from "zod";

export const signupSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export const addressSchema = z.object({
  lineOne: z.string(),
  lineTwo: z.string().nullable(),
  pincode: z.string().length(6),
  country: z.string(),
  city: z.string(),
});

export const updateUserSchema = z.object({
  name: z.string(),
  defaultShippingAddress: z.number().nullable(),
  defaultBillingAddress: z.number().nullable(),
});
