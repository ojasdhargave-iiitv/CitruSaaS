import pool from '../config/db.js';

export interface UserRow {
    id: string;
    username: string;
    email: string;
    password: string;
    created_at: Date;
}

// Initialise the users table the first time the model is loaded
// (equivalent to a Mongoose schema defining its own collection structure)
const initUsersTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                email      TEXT UNIQUE NOT NULL,
                username   TEXT UNIQUE NOT NULL,
                password   TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('[User model] users table ready.');
    } catch (err) {
        console.error('[User model] Failed to init users table:', err);
    }
};

initUsersTable();

// Find a user by their email address
export const findUserByEmail = async (email: string): Promise<UserRow | null> => {
    const result = await pool.query<UserRow>(
        'SELECT id, username, email, password, created_at FROM users WHERE email = $1',
        [email]
    );
    return result.rows[0] ?? null;
};

// Find a user by username
export const findUserByUsername = async (username: string): Promise<UserRow | null> => {
    const result = await pool.query<UserRow>(
        'SELECT id, username, email, password, created_at FROM users WHERE username = $1',
        [username]
    );
    return result.rows[0] ?? null;
};

// Check if email OR username already exists (for signup validation)
export const userExists = async (username: string, email: string): Promise<boolean> => {
    const result = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email]
    );
    return result.rows.length > 0;
};

// Create a new user and return the created record
export const createUser = async (
    username: string,
    email: string,
    hashedPassword: string
): Promise<UserRow> => {
    const result = await pool.query<UserRow>(
        `INSERT INTO users (username, email, password)
         VALUES ($1, $2, $3)
         RETURNING id, username, email, password, created_at`,
        [username, email, hashedPassword]
    );
    if (!result.rows[0]) throw new Error('Insert failed — no row returned');
    return result.rows[0];
};
