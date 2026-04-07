// ════════════════════════════════════════════════════════════
// MONGODB MODULE — TypeScript
// File: mongodb.ts
// ════════════════════════════════════════════════════════════

// ─── 1. INSTALL ──────────────────────────────────────────────
// npm install mongoose
// npm install -D @types/mongoose

// ─── 2. ENV VARIABLES (.env) ─────────────────────────────────
// MONGO_URI=mongodb://localhost:27017/your-db

// ─── 3. IMPORTS ─────────────────────────────────────────────
import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── 4. CONFIGURATION ────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test-db';

// ─── 5. DATABASE CONNECTION ─────────────────────────────────
export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }
};

// ─── 6. SAMPLE USER MODEL (EXTENDABLE) ──────────────────────
export interface IUser extends Document {
  username: string;
  password: string;
}

const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

// ─── 7. SAMPLE DB HELPERS (FOR JWT MODULE INTEGRATION) ──────
export const findUserByUsername = async (username: string) => {
  return User.findOne({ username });
};

export const createUser = async (data: { username: string; password: string }) => {
  return User.create(data);
};

// ─── 8. APP INTEGRATION (server.ts / app.ts) ─────────────────
// import express from 'express';
// import { connectDB } from './mongodb';
//
// const app = express();
// connectDB();
//
// app.listen(3000);