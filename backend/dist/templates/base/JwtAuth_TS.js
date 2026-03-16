import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// ─── CONFIGURATION ──────────────────────────────────────────
// Set your JWT secret via environment variable (recommended)
// or replace the fallback string below.
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// ─── DATABASE HELPERS ───────────────────────────────────────
// Replace these placeholder functions with your own database
// logic (Prisma, TypeORM, Drizzle, Mongoose, raw SQL, etc.).
/**
 * Check whether a user with the given username or email already exists.
 * @returns true if taken, false otherwise
 */
async function userExists(username, email) {
    // TODO: Replace with your DB query
    // Example (Prisma):
    //   const user = await prisma.user.findFirst({
    //     where: { OR: [{ username }, { email }] },
    //   });
    //   return !!user;
    throw new Error('userExists() is not implemented. Replace this with your DB query.');
}
/**
 * Create a new user record and return the created user.
 */
async function createUser(username, email, hashedPassword) {
    // TODO: Replace with your DB insert
    // Example (Prisma):
    //   return prisma.user.create({
    //     data: { username, email, password: hashedPassword },
    //   });
    throw new Error('createUser() is not implemented. Replace this with your DB insert.');
}
/**
 * Find a user by their email address.
 * @returns the user record or null
 */
async function findUserByEmail(email) {
    // TODO: Replace with your DB query
    // Example (Prisma):
    //   return prisma.user.findUnique({ where: { email } });
    throw new Error('findUserByEmail() is not implemented. Replace this with your DB query.');
}
// ─── SIGNUP ─────────────────────────────────────────────────
export const userSignupPost = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email and password are required.' });
        }
        const taken = await userExists(username, email);
        if (taken) {
            return res.status(400).json({ error: 'Username or email already exists.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser(username, email, hashedPassword);
        const token = jwt.sign({ userId: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({ message: 'User signup successful', token });
    }
    catch (err) {
        console.error('[Signup Error]', err);
        res.status(500).json({ error: 'Signup failed. Please try again.' });
    }
};
// ─── LOGIN ──────────────────────────────────────────────────
export const userLoginPost = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ error: 'No account found with that email.' });
        }
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            return res.status(401).json({ error: 'Incorrect password.' });
        }
        const token = jwt.sign({ userId: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
        res.status(200).json({ message: 'User login successful', token });
    }
    catch (err) {
        console.error('[Login Error]', err);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
};
//# sourceMappingURL=JwtAuth_TS.js.map