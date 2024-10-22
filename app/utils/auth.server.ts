import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyLogin(phone: string, password: string) {
  const user = await db('users').where({ phone }).first();
  if (!user) return null;
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;
  
  return user;
}

export function createToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as { userId: string };
  } catch (error) {
    return null;
  }
}
