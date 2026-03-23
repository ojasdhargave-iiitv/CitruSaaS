import { createClient } from "@supabase/supabase-js";
import { prisma } from "../config/prisma.js";
import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "https://kmlneesbwtodjylnnynx.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required in .env for uploading files.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = "templates";

async function uploadFile(filePath: string, storagePath: string) {
  const fileContent = await fs.readFile(filePath);
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileContent, {
      upsert: true,
      contentType: getContentType(filePath),
    });

  if (error) {
    console.error(`Error uploading ${filePath}: ${error.message}`);
  } else {
    console.log(`Successfully uploaded ${filePath} to ${storagePath}`);
  }
}

function getContentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".ts":
      return "text/typescript";
    case ".js":
      return "text/javascript";
    case ".json":
      return "application/json";
    case ".html":
      return "text/html";
    case ".css":
      return "text/css";
    default:
      return "application/octet-stream";
  }
}

async function uploadDirectory(localDir: string, storageDir: string) {
  const entries = await fs.readdir(localDir, { withFileTypes: true });

  for (const entry of entries) {
    const localPath = path.join(localDir, entry.name);
    const storagePath = `${storageDir}/${entry.name}`.replace(/\\/g, "/");

    if (entry.isDirectory()) {
      await uploadDirectory(localPath, storagePath);
    } else {
      await uploadFile(localPath, storagePath);
    }
  }
}

async function main() {
  console.log("🚀 Starting Template Migration to Supabase...");

  try {
    // 1. Create bucket if it doesn't exist
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) throw bucketError;

    if (!buckets.find((b) => b.name === BUCKET_NAME)) {
      console.log(`Creating bucket '${BUCKET_NAME}'...`);
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true, // You can set this to false if you prefer private
      });
      if (createError) throw createError;
    }

    // 2. Upload "base" templates
    const baseDir = path.resolve(process.cwd(), "src/templates/base");
    if (await fs.pathExists(baseDir)) {
      console.log("📤 Uploading base templates...");
      await uploadDirectory(baseDir, "templates/base");
      
      // Upsert metadata
      await prisma.template.upsert({
        where: { id: "00000000-0000-0000-0000-000000000001" }, // Dummy static ID for base
        create: {
          id: "00000000-0000-0000-0000-000000000001",
          name: "Base Template Bundle",
          type: "base",
          path: "templates/base",
          description: "Core boilerplate files for features like JWT, Websocket, etc."
        },
        update: {
          path: "templates/base"
        }
      });
    }

    // 3. Upload "initial-structure" templates
    const initialDir = path.resolve(process.cwd(), "src/templates/initial-structure");
    if (await fs.pathExists(initialDir)) {
      console.log("📤 Uploading initial structure...");
      await uploadDirectory(initialDir, "templates/initial-structure");

      // Upsert metadata
      await prisma.template.upsert({
        where: { id: "00000000-0000-0000-0000-000000000002" }, // Dummy static ID for initial
        create: {
          id: "00000000-0000-0000-0000-000000000002",
          name: "Initial IDE Structure",
          type: "initial",
          path: "templates/initial-structure",
          description: "Initial project scaffold including backend/frontend folders."
        },
        update: {
          path: "templates/initial-structure"
        }
      });
    }

    console.log("✅ Migration completed successfully.");
  } catch (error: any) {
    console.error("❌ Error during migration:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();


/*
If you add new templates locally and want to sync them again:

powershell
cd backend
npx tsx src/scripts/uploadTemplates.ts

Your system is now clean, scalable, and fetching templates dynamically from Supabase!
*/
