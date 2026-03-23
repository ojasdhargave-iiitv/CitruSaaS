import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, description, framework, privacy, userId } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        // Create using Prisma which targets the "projects" table (lowercase)
        const newProject = await prisma.project.create({
            data: {
                name,
                description: description || '',
                framework: framework || '',
                privacy: privacy || 'public',
                userId: (userId && userId.trim() !== "") ? userId : null
            }
        });

        res.json(newProject);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const getProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Project ID is required" });
        }

        const project = await prisma.project.findUnique({
            where: { id: id as string }
        });
        
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        res.json(project);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const listProjects = async (req: Request, res: Response) => {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(projects);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Project ID is required" });
        }

        await prisma.project.delete({
            where: { id: id as string }
        });
        res.json({ message: "Project deleted successfully" });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
