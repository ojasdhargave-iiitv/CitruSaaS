import { z } from "zod";
export declare const boilerplateSchema: z.ZodObject<{
    auth: z.ZodEnum<{
        jwt: "jwt";
        none: "none";
    }>;
    database: z.ZodLiteral<"postgres">;
    modules: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type BoilerplateConfig = z.infer<typeof boilerplateSchema>;
//# sourceMappingURL=schema.d.ts.map