import { z } from "zod";

export const boilerplateSchema = z.object({
  auth: z.enum(["jwt", "none"]),
  database: z.literal("postgres"),
  modules: z.array(z.string()),
});

export type BoilerplateConfig = z.infer<typeof boilerplateSchema>;
