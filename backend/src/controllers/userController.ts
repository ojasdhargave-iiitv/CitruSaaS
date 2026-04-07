import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

const JWT_SECRET = process.env.jwt_secret as string;

export const userSignupPost = async (req: any, res: any) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required.' });
    }

    const taken = await prisma.user.findFirst({
        where: {
            OR: [
                { username },
                { email }
            ]
        }
    });

    if (taken) {
      return res.status(400).json({ error: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 6);
    
    // Create use prisma - mapped to "users" table
    const user = await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword
        }
    });

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({ message: 'User signup successful', token, user: { id: user.id, username: user.username, email: user.email, isPremium: user.isPremium } });

  } catch (err: any) {
    console.error('[Signup Error]', err);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
};

export const userLoginPost = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
      return res.status(400).json({ error: 'No account found with that email.' });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({ message: 'User login successful', token, user: { id: user.id, username: user.username, email: user.email, isPremium: user.isPremium } });

  } catch (err: any) {
    console.error('[Login Error]', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

export const upgradePremium = async (req: any, res: any) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isPremium: true }
    });

    res.status(200).json({ message: 'User upgraded to premium', isPremium: user.isPremium });
  } catch (err: any) {
    console.error('[Upgrade Premium Error]', err);
    res.status(500).json({ error: 'Upgrade failed.' });
  }
};

export const downgradePremium = async (req: any, res: any) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isPremium: false }
    });

    res.status(200).json({ message: 'User downgraded to free tier', isPremium: user.isPremium });
  } catch (err: any) {
    console.error('[Downgrade Premium Error]', err);
    res.status(500).json({ error: 'Downgrade failed.' });
  }
};
