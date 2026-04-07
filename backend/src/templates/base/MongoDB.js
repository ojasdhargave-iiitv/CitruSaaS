// ════════════════════════════════════════════════════════════
// MONGODB MODULE — JavaScript
// File: mongodb.js
// ════════════════════════════════════════════════════════════

// ─── 1. INSTALL ──────────────────────────────────────────────
// npm install mongoose

// ─── 2. ENV VARIABLES (.env) ─────────────────────────────────
// MONGO_URI=mongodb://localhost:27017/your-db

// ─── 3. IMPORTS ─────────────────────────────────────────────
const mongoose = require('mongoose');

// ─── 4. CONFIGURATION ────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test-db';

// ─── 5. DATABASE CONNECTION ─────────────────────────────────
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }
};

// ─── 6. SAMPLE USER MODEL ───────────────────────────────────
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

// ─── 7. SAMPLE DB HELPERS (JWT COMPATIBLE) ──────────────────
const findUserByUsername = async (username) => {
  return User.findOne({ username });
};

const createUser = async (data) => {
  return User.create(data);
};

// ─── 8. APP INTEGRATION (server.js / app.js) ─────────────────
// const express = require('express');
// const { connectDB } = require('./mongodb');
//
// const app = express();
// connectDB();
//
// app.listen(3000);

// ─── EXPORTS ────────────────────────────────────────────────
module.exports = {
  connectDB,
  User,
  findUserByUsername,
  createUser
};