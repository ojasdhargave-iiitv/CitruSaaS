import {} from "express";
import fs from "fs-extra";
import path from "path";
// Assuming we are in backend/src/controllers
// backend root is ../../
// project root is ../../../
// But wait, if we run from backend root:
// path.resolve() is backend/
// We want to access the parent of backend.
const PROJECT_ROOT = path.resolve(process.cwd(), "..");
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
//# sourceMappingURL=fileController.js.map