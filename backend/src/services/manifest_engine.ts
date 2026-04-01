import fs from 'fs-extra';
import path from 'path';

// ==========================================
// 1. MANIFEST STRUCTURE (manifest.json)
// ==========================================

export interface FileCopyTask {
  source: string;
  target: string;
}

export interface CodeInjection {
  targetFile: string;
  hook: string; // The placeholder or hook name in the target file (e.g., '// @HOOK: ROUTES')
  content: string; // The code to inject
}

export interface ModuleManifest {
  name: string;
  version?: string;
  dependencies?: string[]; // Array of module names this module depends on (e.g. ['zod-validation'])
  files: FileCopyTask[];
  imports?: CodeInjection[];
  middlewares?: CodeInjection[];
  routes?: CodeInjection[];
  env?: string[]; // Required environment variables
  db?: string[];
}

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

/**
 * Topologically sorts modules based on their dependencies so dependencies are injected first.
 */
export function resolveDependencies(
  moduleNames: string[],
  allManifests: Map<string, ModuleManifest>
): string[] {
  const resolved: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(modName: string) {
    if (visited.has(modName)) return;
    if (visiting.has(modName)) {
      throw new Error(`Circular dependency detected involving module: ${modName}`);
    }

    visiting.add(modName);

    const manifest = allManifests.get(modName);
    if (!manifest) {
      throw new Error(`Manifest not found for module: ${modName}`);
    }

    if (manifest.dependencies) {
      for (const dep of manifest.dependencies) {
        if (!allManifests.has(dep)) {
          console.warn(`Warning: Dependency ${dep} for module ${modName} is not in the available manifests.`);
        }
        // Recursively resolve dependencies
        visit(dep);
      }
    }

    visiting.delete(modName);
    visited.add(modName);
    resolved.push(modName);
  }

  for (const mod of moduleNames) {
    visit(mod);
  }

  return resolved;
}

/**
 * Copies static files from the module template directory to the target project directory.
 * NOTE: If templates are pulled from Supabase, this function would adapt to fetch the file contents.
 */
export async function copyModuleFiles(
  manifest: ModuleManifest,
  sourceBaseDir: string,
  targetBaseDir: string
): Promise<void> {
  for (const fileTask of manifest.files) {
    const sourcePath = path.join(sourceBaseDir, manifest.name, fileTask.source);
    const targetPath = path.join(targetBaseDir, fileTask.target);

    if (await fs.pathExists(sourcePath)) {
      await fs.ensureDir(path.dirname(targetPath));
      await fs.copy(sourcePath, targetPath, { overwrite: true });
    } else {
      console.warn(`File not found: ${sourcePath}`);
    }
  }
}

/**
 * Deterministically injects code into target files at specified hooks.
 * Avoids duplicate injections by checking if content already exists.
 */
export async function injectCode(
  injections: CodeInjection[],
  targetBaseDir: string
): Promise<void> {
  for (const injection of injections) {
    const targetPath = path.join(targetBaseDir, injection.targetFile);
    
    if (!(await fs.pathExists(targetPath))) {
      console.warn(`Target file for injection not found: ${targetPath}. Skipping...`);
      continue;
    }

    let fileContent = await fs.readFile(targetPath, 'utf8');

    // Avoid duplicate imports / middleware / routes
    if (fileContent.includes(injection.content.trim())) {
      continue;
    }

    // Replace the hook placeholder with the new content + the placeholder (to allow future injections)
    // Example: // @HOOK: IMPORT_ROUTES
    const hookString = injection.hook;
    if (fileContent.includes(hookString)) {
      fileContent = fileContent.replace(
        hookString,
        `${injection.content}\n${hookString}`
      );
      await fs.writeFile(targetPath, fileContent, 'utf8');
    } else {
      console.warn(`Hook ${hookString} not found in ${targetPath}`);
    }
  }
}

// ==========================================
// 3. GENERATOR SERVICE
// ==========================================

export interface GeneratorConfig {
  modulesDir: string;      // Base directory where templates natively live (or temp dir pulled from Supabase)
  targetDir: string;       // Output directory for the generated SaaS backend
  selectedModules: string[];
}

export class GeneratorService {
  constructor(private config: GeneratorConfig) {}

  /**
   * Loads a manifest file.
   * If pulling from Supabase, you would fetch the manifest.json blob directly from the bucket here.
   */
  async loadManifest(moduleName: string): Promise<ModuleManifest> {
    const manifestPath = path.join(this.config.modulesDir, moduleName, 'manifest.json');
    if (!(await fs.pathExists(manifestPath))) {
      throw new Error(`Manifest not found for module ${moduleName} at ${manifestPath}`);
    }
    const manifestContent = await fs.readJson(manifestPath);
    return manifestContent as ModuleManifest;
  }

  /**
   * Main orchestrator function
   */
  async generate(): Promise<void> {
    const allManifests = new Map<string, ModuleManifest>();
    const loadQueue = [...this.config.selectedModules];
    const loaded = new Set<string>();

    // 1. Load all manifests iteratively, traversing the dependency tree
    while (loadQueue.length > 0) {
      const current = loadQueue.pop()!;
      if (!loaded.has(current)) {
        const manifest = await this.loadManifest(current);
        allManifests.set(current, manifest);
        loaded.add(current);
        
        // Push dependencies into loadQueue
        if (manifest.dependencies) {
          manifest.dependencies.forEach(dep => {
            if (!loaded.has(dep)) loadQueue.push(dep);
          });
        }
      }
    }

    // 2. Resolve target modules in correct topologically sorted order
    const orderedModules = resolveDependencies(this.config.selectedModules, allManifests);
    console.log(`Resolved module generation order: ${orderedModules.join(' -> ')}`);

    // 3. Ensure target directory setup
    await fs.ensureDir(this.config.targetDir);

    // 4. Execute file placement and code injection for each block
    for (const modName of orderedModules) {
      const manifest = allManifests.get(modName)!;
      console.log(`Generating module: ${manifest.name}`);

      // a. Copy core files defined by module
      if (manifest.files?.length > 0) {
        await copyModuleFiles(manifest, this.config.modulesDir, this.config.targetDir);
      }

      // b. Process Injections (Imports, middlewares, routes)
      const injections: CodeInjection[] = [];
      if (manifest.imports) injections.push(...manifest.imports);
      if (manifest.middlewares) injections.push(...manifest.middlewares);
      if (manifest.routes) injections.push(...manifest.routes);

      if (injections.length > 0) {
        await injectCode(injections, this.config.targetDir);
      }
      
      console.log(`Successfully integrated: ${manifest.name}`);
    }

    // 5. Post-generation step:
    // If you need to push the generated project directly into an output Supabase bucket,
    // you would compress `this.config.targetDir` to a .zip and upload it with supabase-js here.
    console.log("SaaS Boilerplate Generation Completed Successfully!");
  }
}
