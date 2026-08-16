import { z } from "zod";

export const cartCheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        qty: z.number().int().positive().max(20),
      }),
    )
    .min(1)
    .max(50),
});

export type CartCheckoutInput = z.infer<typeof cartCheckoutSchema>;
