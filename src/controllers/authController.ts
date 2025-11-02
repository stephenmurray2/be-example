import { Request, Response } from 'express';
import { generateToken } from '../middlewares/auth.js';
import { getDatabase } from '../config/database.js';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Example: In production, you would validate credentials against the database
    // and hash the password using bcrypt
    const db = getDatabase();
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), {
      email: user.email,
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const db = getDatabase();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    // In production, hash the password using bcrypt
    const result = await db.collection('users').insertOne({
      email,
      password, // Should be hashed in production
      name,
      createdAt: new Date(),
    });

    const token = generateToken(result.insertedId.toString(), {
      email,
    });

    res.status(201).json({
      token,
      user: {
        id: result.insertedId,
        email,
        name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
