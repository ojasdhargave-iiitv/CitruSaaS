import { PrismaClient } from "../generated/prisma/client.js";
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma ||
    new PrismaClient({
        log: ["query"],
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
//# sourceMappingURL=prisma.js.map