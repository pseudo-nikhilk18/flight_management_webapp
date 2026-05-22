import { z } from "zod";

export const searchSchema = z
  .object({
    origin: z.enum(["DEL", "BOM", "BLR", "HYD"]),
    destination: z.enum(["DEL", "BOM", "BLR", "HYD"]),
    date: z.string().min(1, "Select a travel date"),
    passengers: z.coerce.number().int().min(1).max(6),
  })
  .refine((value) => value.origin !== value.destination, {
    message: "Origin and destination must be different",
    path: ["destination"],
  });

export type SearchInput = z.infer<typeof searchSchema>;
