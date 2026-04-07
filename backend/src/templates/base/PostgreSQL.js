// ════════════════════════════════════════════════════════════
// SUPABASE POSTGRES MODULE — JavaScript
// File: supabase.js
// ════════════════════════════════════════════════════════════

// ─── 1. INSTALL ──────────────────────────────────────────────
// npm install @supabase/supabase-js

// ─── 2. ENV VARIABLES (.env) ─────────────────────────────────
// SUPABASE_URL=https://your-project.supabase.co
// SUPABASE_ANON_KEY=your-anon-key

// ─── 3. IMPORTS ─────────────────────────────────────────────
const { createClient } = require("@supabase/supabase-js");

// ─── 4. CONFIGURATION ────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

// ─── 5. CLIENT INITIALIZATION ───────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── 6. DB HELPERS (JWT COMPATIBLE) ─────────────────────────

// Find user
const findUserByUsername = async (username) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error) return null;
  return data;
};

// Create user
const createUser = async (data) => {
  const { error } = await supabase
    .from("users")
    .insert([data]);

  if (error) throw error;
};

// ─── 7. GENERIC QUERY ───────────────────────────────────────
const queryTable = async (table) => {
  const { data, error } = await supabase.from(table).select("*");
  if (error) throw error;
  return data;
};

// ─── 8. APP INTEGRATION ─────────────────────────────────────
// console.log("Supabase connected");

// ─── EXPORTS ────────────────────────────────────────────────
module.exports = {
  supabase,
  findUserByUsername,
  createUser,
  queryTable
};