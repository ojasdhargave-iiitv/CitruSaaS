// ════════════════════════════════════════════════════════════
// JWT AUTH MODULE — JavaScript
// File: auth.js  (split into routes/controller as you prefer)
// ════════════════════════════════════════════════════════════

// ─── 1. ENV VARIABLES (.env) ─────────────────────────────────
// JWT_SECRET=your-super-secret-key
// JWT_EXPIRES_IN=30d
// PORT=3000

// ─── 2. INSTALL ──────────────────────────────────────────────
// npm install bcrypt jsonwebtoken express dotenv

const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { Router } = require('express');

// ─── 3. CONFIGURATION ────────────────────────────────────────
const JWT_SECRET  = process.env.JWT_SECRET    || 'your-secret-key';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '30d';

// ─── 4. DB HELPERS — replace with your ORM ───────────────────
// Mongoose:  return User.findOne({ username });
// Prisma:    return prisma.user.findUnique({ where: { username } });
// Sequelize: return User.findOne({ where: { username } });

/**
 * @param {string} username
 * @returns {Promise<object|null>}
 */
async function findUserByUsername(username) {
  throw new Error('findUserByUsername() not implemented. Replace with your DB query.');
}

/**
 * @param {{ username: string, password: string }} data
 * @returns {Promise<object>}
 */
async function createUser(data) {
  throw new Error('createUser() not implemented. Replace with your DB insert.');
}

// ─── 5. CONTROLLERS ──────────────────────────────────────────
const userSignupPost = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }
    const existing = await findUserByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'Username already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser({ username, password: hashedPassword });
    res.status(201).json({ message: 'User signup successful' });
  } catch (err) {
    console.error('[Signup Error]', err);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
};

const userLoginPost = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(400).json({ error: 'User not found.' });
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.status(200).json({ message: 'User login successful', token });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// ─── 6. ROUTER ───────────────────────────────────────────────
const authRouter = Router();
authRouter.post('/signup', userSignupPost);
authRouter.post('/login',  userLoginPost);

module.exports = { authRouter, userSignupPost, userLoginPost };

// ─── 7. MOUNT IN app.js ──────────────────────────────────────
// const express = require('express');
// const { authRouter } = require('./auth');
//
// const app = express();
// app.use(express.json());
// app.use('/api/auth', authRouter);
//
// app.listen(process.env.PORT || 3000);