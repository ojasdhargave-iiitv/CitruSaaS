import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "https://kmlneesbwtodjylnnynx.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SERVICE_ROLE_KEY";

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("WARNING: SUPABASE_SERVICE_ROLE_KEY is not defined in .env. Storage operations might fail.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
