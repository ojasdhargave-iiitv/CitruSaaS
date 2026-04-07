// ════════════════════════════════════════════════════════════
// JWT AUTH MODULE — TypeScript
// File: auth.ts  (split into routes/controller as you prefer)
// ════════════════════════════════════════════════════════════

// ─── 1. ENV VARIABLES (.env) ─────────────────────────────────
// JWT_SECRET=your-super-secret-key
// JWT_EXPIRES_IN=30d
// PORT=3000

// ─── 2. INSTALL ──────────────────────────────────────────────
// npm install bcrypt jsonwebtoken express
// npm install -D @types/bcrypt @types/jsonwebtoken @types/express

// ─── 3. TYPES ────────────────────────────────────────────────
import { Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  username: string;
}

export interface AuthBody {
  username: string;
  password: string;
}

// ─── 4. CONFIGURATION ────────────────────────────────────────
const JWT_SECRET  = process.env.JWT_SECRET    || 'your-secret-key';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '30d';

// ─── 5. DB HELPERS — replace with your ORM ───────────────────
// Mongoose:  return User.findOne({ username });
// Prisma:    return prisma.user.findUnique({ where: { username } });
// Sequelize: return User.findOne({ where: { username } });
async function findUserByUsername(username: string): Promise<any | null> {
  throw new Error('findUserByUsername() not implemented. Replace with your DB query.');
}

// Mongoose:  return User.create(data);
// Prisma:    return prisma.user.create({ data });
// Sequelize: return User.create(data);
async function createUser(data: { username: string; password: string }): Promise<any> {
  throw new Error('createUser() not implemented. Replace with your DB insert.');
}

// ─── 6. CONTROLLERS ──────────────────────────────────────────
export const userSignupPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as AuthBody;
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required.' }); return;
    }
    const existing = await findUserByUsername(username);
    if (existing) {
      res.status(400).json({ error: 'Username already exists.' }); return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser({ username, password: hashedPassword });
    res.status(201).json({ message: 'User signup successful' });
  } catch (err) {
    console.error('[Signup Error]', err);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
};

export const userLoginPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as AuthBody;
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required.' }); return;
    }
    const user = await findUserByUsername(username);
    if (!user) {
      res.status(400).json({ error: 'User not found.' }); return;
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      res.status(401).json({ error: 'Invalid credentials.' }); return;
    }
    const token = jwt.sign(
      { userId: user.id, username: user.username } as JwtPayload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.status(200).json({ message: 'User login successful', token });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// ─── 7. ROUTER ───────────────────────────────────────────────
export const authRouter = Router();
authRouter.post('/signup', userSignupPost);
authRouter.post('/login',  userLoginPost);

// ─── 8. MOUNT IN app.ts ──────────────────────────────────────
// import express from 'express';
// import { authRouter } from './auth';
//
// const app = express();
// app.use(express.json());
// app.use('/api/auth', authRouter);
//
// app.listen(process.env.PORT || 3000);