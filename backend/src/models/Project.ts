import pool from '../config/db.js';

export interface ProjectRow {
    id: string;
    name: string;
    description: string;
    framework: string;
    privacy: string;
    created_at: Date;
}

const initProjectsTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name       TEXT NOT NULL,
                description TEXT,
                framework  TEXT,
                privacy    TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('[Project model] projects table ready.');
    } catch (err) {
        console.error('[Project model] Failed to init projects table:', err);
    }
};

initProjectsTable();
