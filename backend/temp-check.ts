import 'dotenv/config';
import { prisma } from './src/config/prisma.js';

async function main() {
    try {
        const result = await prisma.project.create({
            data: {
                name: "test project",
                description: "",
                framework: "",
                privacy: "public",
                userId: null
            }
        });
        console.log("Success:", result);
    } catch (e: any) {
        console.error("Prisma Error:", e);
    }
}
main();
