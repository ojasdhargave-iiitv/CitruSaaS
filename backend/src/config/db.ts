import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

pool.on('error', (err: any) => {
    console.error('[DB] Unexpected error on idle client', err);
});

export default pool;
