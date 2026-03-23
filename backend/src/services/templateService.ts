import fs from "fs-extra";
import path from "path";
import { prisma } from "../config/prisma.js";

// Template root relative to backend/src
const TEMPLATES_ROOT = path.join(process.cwd(), "src", "templates");

export const getTemplateMetadata = async (type: string) => {
    try {
        return await prisma.template.findFirst({
            where: { type }
        });
    } catch (err: any) {
        throw new Error(`Error fetching template metadata: ${err.message}`);
    }
};

/**
 * Recursively lists all files in a local directory.
 */
async function walkDir(dir: string, baseDir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let results: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            const subResults = await walkDir(fullPath, baseDir);
            results = results.concat(subResults);
        } else {
            // Return path relative to baseDir with forward slashes
            const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
            results.push(relativePath);
        }
    }
    return results;
}

export const getTemplateFiles = async (type: "base" | "initial") => {
    try {
        const templatePath = type === "initial" 
            ? path.join(TEMPLATES_ROOT, "initial-structure") 
            : path.join(TEMPLATES_ROOT, "base");
            
        if (!await fs.exists(templatePath)) {
            console.error(`Template path not found: ${templatePath}`);
            return [];
        }
        
        return await walkDir(templatePath, templatePath);
    } catch (err: any) {
        throw new Error(err.message);
    }
};

/**
 * Fetches all files and their contents for a template
 */
export const getTemplateFilesWithContent = async (type: "base" | "initial") => {
    try {
        const templatePath = type === "initial" 
            ? path.join(TEMPLATES_ROOT, "initial-structure") 
            : path.join(TEMPLATES_ROOT, "base");
            
        const files = await getTemplateFiles(type);
        const results = [];
        
        for (const relativePath of files) {
            const fullPath = path.join(templatePath, relativePath);
            const content = await fs.readFile(fullPath, "utf-8");
            results.push({
                relativePath,
                content
            });
        }
        return results;
    } catch (err: any) {
        throw new Error(`Error fetching template files with content: ${err.message}`);
    }
};

export const getBaseTemplateContent = async (sourceName: string): Promise<string> => {
    try {
        const fullPath = path.join(TEMPLATES_ROOT, "base", sourceName);
        if (!await fs.exists(fullPath)) {
            throw new Error(`Template file '${sourceName}' not found in local templates/base/ folder.`);
        }
        return await fs.readFile(fullPath, "utf-8");
    } catch (err: any) {
        throw new Error(`Error fetching base template: ${err.message}`);
    }
};
