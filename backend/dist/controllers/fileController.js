import {} from "express";
import fs from "fs-extra";
import path from "path";
// Assuming we are in backend/src/controllers
// backend root is ../../
// project root is ../../../
// But wait, if we run from backend root:
// path.resolve() is backend/
// We want to access the parent of backend.
const PROJECT_ROOT = path.resolve(process.cwd(), "sandbox");
export const createFile = async (req, res) => {
    try {
        const { filePath } = req.body;
        if (!filePath) {
            return res.status(400).json({ error: "FilePath is required" });
        }
        const fullPath = path.resolve(PROJECT_ROOT, filePath);
        // Security check (optional but good)
        if (!fullPath.startsWith(PROJECT_ROOT)) {
            return res.status(403).json({ error: "Access denied" });
        }
        if (await fs.pathExists(fullPath)) {
            return res.status(400).json({ error: "File already exists" });
        }
        await fs.ensureFile(fullPath);
        res.json({ message: "File created successfully", path: filePath });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
export const saveFile = async (req, res) => {
    try {
        const { filePath, content } = req.body;
        if (!filePath) {
            return res.status(400).json({ error: "FilePath is required" });
        }
        // content can be empty string
        const fullPath = path.resolve(PROJECT_ROOT, filePath);
        if (!fullPath.startsWith(PROJECT_ROOT)) {
            return res.status(403).json({ error: "Access denied" });
        }
        await fs.writeFile(fullPath, content);
        res.json({ message: "File saved successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
export const getFile = async (req, res) => {
    try {
        const { filePath } = req.query;
        if (!filePath || typeof filePath !== 'string') {
            return res.status(400).json({ error: "FilePath is required" });
        }
        const fullPath = path.resolve(PROJECT_ROOT, filePath);
        if (!fullPath.startsWith(PROJECT_ROOT)) {
            return res.status(403).json({ error: "Access denied" });
        }
        if (!await fs.pathExists(fullPath)) {
            return res.status(404).json({ error: "File not found" });
        }
        const content = await fs.readFile(fullPath, "utf-8");
        res.json({ content });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
export const listFiles = async (req, res) => {
    try {
        const { dirPath } = req.query;
        // Default to root if not provided
        const relativePath = typeof dirPath === 'string' ? dirPath : '.';
        const fullPath = path.resolve(PROJECT_ROOT, relativePath);
        if (!fullPath.startsWith(PROJECT_ROOT)) {
            return res.status(403).json({ error: "Access denied" });
        }
        if (!await fs.pathExists(fullPath)) {
            return res.status(404).json({ error: "Directory not found" });
        }
        const entries = await fs.readdir(fullPath, { withFileTypes: true });
        const files = entries.map((entry) => ({
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file',
            path: path.relative(PROJECT_ROOT, path.join(fullPath, entry.name)).replace(/\\/g, '/')
        }));
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
        const { moduleId, fileType } = req.body;
        if (!moduleId || !fileType) {
            return res.status(400).json({ error: "moduleId and fileType are required" });
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
        const sourcePath = path.resolve(process.cwd(), "src/templates/base", sourceName);
        const fullTargetPath = path.resolve(PROJECT_ROOT, "backend", "src", sourceName);
        const permTargetPath = path.resolve(process.cwd(), "src/templates/initial-structure", "backend", "src", sourceName);
        if (!fullTargetPath.startsWith(PROJECT_ROOT)) {
            return res.status(403).json({ error: "Access denied" });
        }
        if (await fs.pathExists(fullTargetPath)) {
            return res.status(400).json({ error: "File already exists" });
        }
        await fs.copy(sourcePath, fullTargetPath);
        // Always place the template in the initial-structure backend/src as requested
        await fs.ensureDir(path.dirname(permTargetPath));
        await fs.copy(sourcePath, permTargetPath);
        res.json({ message: "Template created successfully", path: `backend/src/${sourceName}` });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
export const initWorkspace = async (req, res) => {
    try {
        const sourcePath = path.resolve(process.cwd(), "src/templates/initial-structure");
        if (!await fs.pathExists(sourcePath)) {
            return res.status(500).json({ error: "Initial structure template missing" });
        }
        await fs.emptyDir(PROJECT_ROOT);
        await fs.copy(sourcePath, PROJECT_ROOT);
        // Ensure backend/src exists
        await fs.ensureDir(path.resolve(PROJECT_ROOT, "backend", "src"));
        res.json({ message: "Workspace initialized successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
//# sourceMappingURL=fileController.js.map