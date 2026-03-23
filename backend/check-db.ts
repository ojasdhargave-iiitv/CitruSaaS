import { prisma } from './src/config/prisma.js';
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

async function checkSchema() {
    console.log("--- Prisma Check ---");
    try {
        const projects = await (prisma.project as any).findMany();
        console.log("Prisma Project list (count):", projects.length);
        const files = await (prisma as any).file.findMany();
        console.log("Prisma File list (count):", files.length);
    } catch (err: any) {
        console.log("Prisma error:", err.message);
    }

    console.log("\n--- Direct Postgres Check ---");
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    const tables = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    console.log("Tables found:", tables.rows.map(r => r.tablename));

    for (const table of ['projects', 'Project', 'users', 'User', 'File']) {
        try {
            const cols = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
            console.log(`\nColumns in '${table}':`);
            cols.rows.forEach(c => console.log(` - ${c.column_name} (${c.data_type})`));
        } catch (err) {
            console.log(`Table '${table}' check failed.`);
        }
    }
    
    await client.end();
}

checkSchema();
