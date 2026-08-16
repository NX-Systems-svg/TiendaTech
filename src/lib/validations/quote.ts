import { z } from "zod";

export const quoteRequestSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre completo").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+()\s-]{7,20}$/, "Ingresa un teléfono válido"),
  email: z.email("Ingresa un correo válido").max(200).optional().or(z.literal("")),
  interest: z.enum(["servicio", "producto", "otro"]),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mín. 10 caracteres)").max(1000),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
