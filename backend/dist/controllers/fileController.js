import {} from "express";
import path from "path";
import { prisma } from "../config/prisma.js";
import { FileType } from "../generated/prisma/enums.js";
import * as templateService from "../services/templateService.js";
// We are moving to a fully DB-driven system as requested.
// Removed SANDBOX_ROOT and getProjectPath.
export const createFile = async (req, res) => {
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
export const createFolder = async (req, res) => {
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
export const deleteItem = async (req, res) => {
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
export const saveFile = async (req, res) => {
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
export const loadProject = async (req, res) => {
    try {
        const { projectId } = req.body;
        if (!projectId) {
            return res.status(400).json({ error: "ProjectId is required" });
        }
        // Just check if project exists, nothing to write to disk anymore
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            return res.status(404).json({ error: "Project not found" });
        res.json({ message: "Project loading confirmed (DB driven)" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
export const getFile = async (req, res) => {
    try {
        const { filePath, projectId } = req.query;
        if (!filePath || !projectId) {
            return res.status(400).json({ error: "FilePath and ProjectId are required" });
        }
        const file = await prisma.file.findFirst({
            where: { projectId: projectId, path: filePath }
        });
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }
        res.json({ content: file.content });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
export const listFiles = async (req, res) => {
    try {
        const { dirPath, projectId } = req.query;
        if (!projectId) {
            return res.status(400).json({ error: "ProjectId is required" });
        }
        const parentPath = typeof dirPath === 'string' && dirPath !== '.' ? dirPath : '';
        // Find all files and folders in this directory
        const allItems = await prisma.file.findMany({
            where: { projectId: projectId }
        });
        // Simulating filesystem listing from flat DB table
        const normalizedDirPath = parentPath ? (parentPath.endsWith('/') ? parentPath : parentPath + '/') : '';
        const files = [];
        const seenNames = new Set();
        allItems.forEach(item => {
            if (item.path.startsWith(normalizedDirPath) && item.path !== parentPath) {
                const subPath = item.path.slice(normalizedDirPath.length);
                const pathParts = subPath.split('/');
                const name = pathParts[0];
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
            if (a.type === b.type)
                return a.name.localeCompare(b.name);
            return a.type === 'directory' ? -1 : 1;
        });
        res.json({ files });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
export const createTemplateFile = async (req, res) => {
    try {
        const { moduleId, fileType, projectId } = req.body;
        if (!moduleId || !fileType) {
            return res.status(400).json({ error: "moduleId and fileType are required" });
        }
        if (!projectId) {
            return res.status(400).json({ error: "ProjectId is required" });
        }
        let sourceName = '';
        if (moduleId === 'jwt') {
            sourceName = fileType === 'ts' ? 'JwtAuth_TS.ts' : 'JwtAuth_JS.js';
        }
        else if (moduleId === 'zod') {
            sourceName = fileType === 'ts' ? 'ZodSetup_TS.ts' : 'ZodSetup_JS.js';
        }
        else if (moduleId === 'websocket') {
            sourceName = fileType === 'ts' ? 'WebSocket_TS.ts' : 'WebSocket_JS.js';
        }
        else {
            return res.status(400).json({ error: `Template for '${moduleId}' not defined yet. Please tell me to update backend/src/controllers/fileController.ts to map this module to its template path.` });
        }
        const targetPath = `backend/src/${sourceName}`;
        // Check if file already exists in DB
        const existingFile = await prisma.file.findUnique({
            where: { id: `${projectId}-${targetPath}` }
        });
        if (existingFile) {
            return res.status(400).json({ error: "File already exists" });
        }
        // Fetch from Supabase Storage instead of local fs
        const templateContent = await templateService.getBaseTemplateContent(sourceName);
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
export const initWorkspace = async (req, res) => {
    try {
        const { projectId } = req.body;
        if (!projectId)
            return res.status(400).json({ error: "ProjectId is required" });
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
//# sourceMappingURL=fileController.js.map