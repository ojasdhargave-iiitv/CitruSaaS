// ════════════════════════════════════════════════════════════
// SUPABASE POSTGRES MODULE — TypeScript
// File: supabase.ts
// ════════════════════════════════════════════════════════════

// ─── 1. INSTALL ──────────────────────────────────────────────
// npm install @supabase/supabase-js

// ─── 2. ENV VARIABLES (.env) ─────────────────────────────────
// SUPABASE_URL=https://your-project.supabase.co
// SUPABASE_ANON_KEY=your-anon-key

// ─── 3. IMPORTS ─────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

// ─── 4. CONFIGURATION ────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY!;

// ─── 5. CLIENT INITIALIZATION ───────────────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── 6. SAMPLE TABLE STRUCTURE (PostgreSQL)
// Table: users
// id (uuid, pk)
// username (text, unique)
// password (text)


// ─── 7. DB HELPERS (JWT COMPATIBLE) ─────────────────────────

// Find user by username
export const findUserByUsername = async (username: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error) return null;
  return data;
};

// Create user
export const createUser = async (data: {
  username: string;
  password: string;
}) => {
  const { error } = await supabase
    .from("users")
    .insert([data]);

  if (error) throw error;
};

// ─── 8. OPTIONAL: GENERIC QUERY FUNCTION ─────────────────────
export const queryTable = async (table: string) => {
  const { data, error } = await supabase.from(table).select("*");
  if (error) throw error;
  return data;
};

// ─── 9. APP INTEGRATION (app.ts) ─────────────────────────────
// import { supabase } from './supabase';
//
// console.log("Supabase connected");