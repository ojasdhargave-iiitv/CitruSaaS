import { type BoilerplateConfig } from "../config/schema.js";
import { GeneratorService } from "./manifest_engine.js";
import path from "path";
import fs from "fs-extra";
import crypto from "crypto";

export const generateProject = async (config: BoilerplateConfig) => {
  console.log("Generating project with config:", config);

  try {
    // 1. Define paths
    const templatesDir = path.join(process.cwd(), "src", "templates");
    const modulesDir = path.join(templatesDir, "modules");
    
    // Output directory could use a unique ID for each generated project
    const projectId = crypto.randomUUID();
    const targetDir = path.join(process.cwd(), "output", projectId);
    
    // We assume you have a 'base' template you want to copy first
    const baseTemplateDir = path.join(templatesDir, "base");
    
    console.log(`Copying base template from ${baseTemplateDir} to ${targetDir}...`);
    if (await fs.pathExists(baseTemplateDir)) {
      await fs.ensureDir(targetDir);
      await fs.copy(baseTemplateDir, targetDir);
    } else {
      console.warn("Base template not found. Ensure src/templates/base exists.");
      await fs.ensureDir(targetDir);
    }

    // 2. Prepare modules to inject based on config
    const selectedModules: string[] = [];
    
    // Handle specific config options like auth
    if (config.auth === "jwt") {
      selectedModules.push("jwt-auth");
    }
    
    // Add any specific extra modules from config
    if (config.modules && config.modules.length > 0) {
      selectedModules.push(...config.modules);
    }

    // Remove duplicates if any
    const uniqueModules = Array.from(new Set(selectedModules));

    if (uniqueModules.length === 0) {
      console.log("No extra modules selected. Generation complete.");
      return targetDir;
    }

    console.log(`Modules to inject: ${uniqueModules.join(', ')}`);

    // 3. Initialize the Manifest Engine
    const generator = new GeneratorService({
      modulesDir,
      targetDir,
      selectedModules: uniqueModules
    });

    // 4. Fire the generation logic
    await generator.generate();

    console.log(`✅ Generation successful! Project is ready at: ${targetDir}`);
    
    // 5. [FUTURE STEP] Upload to Supabase
    // const zipBuffer = await compressDirectory(targetDir);
    // await supabase.storage.from("generated").upload(`${projectId}.zip`, zipBuffer);
    
    return targetDir;
    
  } catch (error) {
    console.error("❌ Failed to generate project:", error);
    throw error;
  }
};
