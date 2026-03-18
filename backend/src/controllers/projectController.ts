import type { Request, Response } from 'express';
import pool from '../config/db.js';
import '../models/Project.js'; // Ensure the table is created

export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, description, framework, privacy } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }
        
        const result = await pool.query(
            `INSERT INTO projects (name, description, framework, privacy)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, description || '', framework || '', privacy || 'public']
        );
        
        res.json(result.rows[0]);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const getProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`SELECT * FROM projects WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Project not found" });
        }
        res.json(result.rows[0]);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
