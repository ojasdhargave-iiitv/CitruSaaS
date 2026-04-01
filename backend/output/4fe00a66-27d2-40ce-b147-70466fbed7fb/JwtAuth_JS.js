const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ─── CONFIGURATION ──────────────────────────────────────────
// Set your JWT secret via environment variable (recommended)
// or replace the fallback string below.
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ─── DATABASE HELPERS ───────────────────────────────────────
// Replace these placeholder functions with your own database
// logic (Mongoose, Sequelize, Prisma, raw SQL, etc.).

/**
 * Find a user record by username.
 * @param {string} username
 * @returns {Promise<object|null>} user object or null
 */
async function findUserByUsername(username) {
  // TODO: Replace with your DB query
  // Example (Mongoose):  return User.findOne({ username });
  // Example (Prisma):    return prisma.user.findUnique({ where: { username } });
  throw new Error('findUserByUsername() is not implemented. Replace this with your DB query.');
}

/**
 * Create a new user record.
 * @param {object} data - { username, password } (password is already hashed)
 * @returns {Promise<object>} the created user object
 */
async function createUser(data) {
  // TODO: Replace with your DB insert
  // Example (Mongoose):  return User.create(data);
  // Example (Prisma):    return prisma.user.create({ data });
  throw new Error('createUser() is not implemented. Replace this with your DB insert.');
}

// ─── SIGNUP ─────────────────────────────────────────────────
const userSignupPost = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
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

// ─── LOGIN ──────────────────────────────────────────────────
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
      { expiresIn: '30d' }
    );

    res.status(200).json({ message: 'User login successful', token });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

module.exports = { userSignupPost, userLoginPost };
