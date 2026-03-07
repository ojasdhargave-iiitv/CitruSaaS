import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Just the connection — equivalent to mongoose.connect()
// All schema/table SQL lives in the model files (src/models/)
const pool = new Pool({
    // Note: using Supabase connection string (IPv4 pooler URL recommended)

    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // required for Supabase
});

// Log unexpected errors on idle clients
pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client', err);
});

export default pool;
