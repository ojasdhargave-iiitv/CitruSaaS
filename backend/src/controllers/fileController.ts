import { type Request, type Response } from "express";
import path from "path";
import { prisma } from "../config/prisma.js";
import { FileType } from "../generated/prisma/enums.js";
import * as templateService from "../services/templateService.js";

// We are moving to a fully DB-driven system as requested.
// Removed SANDBOX_ROOT and getProjectPath.

export const createFile = async (req: Request, res: Response) => {
    try {
        const { filePath, projectId } = req.body;
        if (!filePath || !projectId) {
            return res.status(400).json({ error: "FilePath and ProjectId are required" });
        }

        const existing = await prisma.file.findFirst({
            where: { projectId, path: filePath }
        });

        if (existing) {
            return res.status(400).json({ error: "File already exists" });
        }

        const newFile = await prisma.file.create({
            data: {
                id: `${projectId}-${filePath}`,
                name: path.basename(filePath),
                path: filePath,
                type: FileType.FILE,
                projectId: projectId,
                content: ""
            }
        });

        res.json({ message: "File created successfully", path: filePath });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const createFolder = async (req: Request, res: Response) => {
    try {
        const { folderPath, projectId } = req.body;
        if (!folderPath || !projectId) {
            return res.status(400).json({ error: "FolderPath and ProjectId are required" });
        }

        const existing = await prisma.file.findFirst({
            where: { projectId, path: folderPath }
        });

        if (existing) {
            return res.status(400).json({ error: "Folder already exists" });
        }

        await prisma.file.create({
            data: {
                id: `${projectId}-${folderPath}`,
                name: path.basename(folderPath),
                path: folderPath,
                type: FileType.FOLDER,
                projectId: projectId,
            }
        });

        res.json({ message: "Folder created successfully", path: folderPath });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteItem = async (req: Request, res: Response) => {
    try {
        const { itemPath, projectId } = req.body;
        if (!itemPath || !projectId) {
            return res.status(400).json({ error: "itemPath and ProjectId are required" });
        }

        // Delete the item and its children (if it's a folder)
        await prisma.file.deleteMany({
            where: {
                OR: [
                    { path: itemPath, projectId },
                    { path: { startsWith: `${itemPath}/` }, projectId }
                ]
            }
        });

        res.json({ message: "Item deleted successfully" });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const saveFile = async (req: Request, res: Response) => {
    try {
        const { filePath, content, projectId } = req.body;
        if (!filePath || !projectId) {
            return res.status(400).json({ error: "FilePath and ProjectId are required" });
        }

        await prisma.file.updateMany({
            where: {
                path: filePath,
                projectId: projectId,
            },
            data: {
                content: content || "",
            }
        });

        res.json({ message: "File saved successfully" });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const loadProject = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.body;
        if (!projectId) {
            return res.status(400).json({ error: "ProjectId is required" });
        }

        // Just check if project exists, nothing to write to disk anymore
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return res.status(404).json({ error: "Project not found" });

        res.json({ message: "Project loading confirmed (DB driven)" });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const getFile = async (req: Request, res: Response) => {
    try {
        const { filePath, projectId } = req.query;
        if (!filePath || !projectId) {
            return res.status(400).json({ error: "FilePath and ProjectId are required" });
        }

        const file = await prisma.file.findFirst({
            where: { projectId: projectId as string, path: filePath as string }
        });

        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }

        res.json({ content: file.content });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const listFiles = async (req: Request, res: Response) => {
    try {
        const { dirPath, projectId } = req.query;
        if (!projectId) {
            return res.status(400).json({ error: "ProjectId is required" });
        }

        const parentPath = typeof dirPath === 'string' && dirPath !== '.' ? dirPath : '';
        
        // Find all files and folders in this directory
        const allItems = await prisma.file.findMany({
            where: { projectId: projectId as string }
        });

        // Simulating filesystem listing from flat DB table
        const normalizedDirPath = parentPath ? (parentPath.endsWith('/') ? parentPath : parentPath + '/') : '';
        
        const files: any[] = [];
        const seenNames = new Set<string>();

        allItems.forEach(item => {
            if (item.path.startsWith(normalizedDirPath) && item.path !== parentPath) {
                const subPath = item.path.slice(normalizedDirPath.length);
                const pathParts = subPath.split('/');
                const name = pathParts[0]!;
                
                if (!seenNames.has(name)) {
                    seenNames.add(name);
                    // It's a directory if:
                    // 1. It has more than 1 part (e.g. "src/file.ts" -> "src" is a dir)
                    // 2. The item itself is a folder entry in the DB and matches this exact path
                    const isDirectory = pathParts.length > 1 || item.type === FileType.FOLDER;
                    files.push({
                        name,
                        type: isDirectory ? 'directory' : 'file',
                        path: normalizedDirPath + name
                    });
                }
            }
        });

        // Sort: directories first, then files
        files.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'directory' ? -1 : 1;
        });

        res.json({ files });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const createTemplateFile = async (req: Request, res: Response) => {
    try {
        const { moduleId, fileType, projectId } = req.body;
        if (!moduleId || !fileType || !projectId) {
            return res.status(400).json({ error: "moduleId, fileType and projectId are required" });
        }

        // Map frontend IDs to storage filenames
        const moduleMap: Record<string, string> = {
            'jwt': 'JwtAuth',
            'zod': 'ZodSetup',
            'websocket': 'WebSocket',
            'oauth': 'OAuthSetup',
            'prisma': 'PrismaSetup',
            'stripe': 'StripeSetup',
            'mongodb': 'MongoDBSetup',
            'mysql': 'MySQLSetup',
            'sessions': 'SessionsSetup'
        };

        const baseName = moduleMap[moduleId] || (moduleId.charAt(0).toUpperCase() + moduleId.slice(1) + 'Setup');
        const sourceName = fileType === 'ts' ? `${baseName}_TS.ts` : `${baseName}_JS.js`;
        const targetPath = `backend/src/${sourceName}`;

        // Fetch from Supabase Storage templates/base/...
        let templateContent: string;
        try {
            templateContent = await templateService.getBaseTemplateContent(sourceName);
        } catch (err: any) {
            return res.status(404).json({ error: `Template file '${sourceName}' for module '${moduleId}' not found in storage templates/base/ folder.` });
        }
        
        await prisma.file.upsert({
            where: { id: `${projectId}-${targetPath}` },
            create: {
                id: `${projectId}-${targetPath}`,
                name: sourceName,
                path: targetPath,
                type: FileType.FILE,
                content: templateContent,
                projectId: projectId,
            },
            update: { content: templateContent }
        });
        
        res.json({ message: "Template created successfully", path: `backend/src/${sourceName}` });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const initWorkspace = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.body;
        if (!projectId) return res.status(400).json({ error: "ProjectId is required" });

        const templateFiles = await templateService.getTemplateFilesWithContent("initial");

        await prisma.file.deleteMany({ where: { projectId } });
        
        for (const fileItem of templateFiles) {
            await prisma.file.create({
                data: {
                    id: `${projectId}-${fileItem.relativePath}`,
                    name: path.basename(fileItem.relativePath),
                    path: fileItem.relativePath,
                    type: FileType.FILE,
                    content: fileItem.content,
                    projectId: projectId
                }
            });
        }

        res.json({ message: "Workspace initialized successfully (DB only)" });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
