import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { emitTopScores } from '../ws/scoreboard.ws';
import bcrypt from 'bcryptjs';
import { createToken, validateCredentials } from '../utils/auth.middleware';

const defaultPrisma = new PrismaClient();

function getPrismaFromArgs(args: any[]): PrismaClient {
  // If last argument is a PrismaClient, use it; else use default
  const last = args[args.length - 1];
  if (last instanceof PrismaClient) return last;
  return defaultPrisma;
}

export const increaseScore = async (req: Request, res: Response, ...args: any[]) => {
  const prisma: any = getPrismaFromArgs(args);
  const userId = req.user.id;
  // Only allow the authenticated user to update their own score
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // No way to update another user's score, only self
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { score: { increment: 1 } }
    });
    emitTopScores(); // push to WebSocket clients
    return res.json({ message: 'Score updated', newScore: updated.score });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update score' });
  }
};

export const getTopScores = async (_req: Request, res: Response, ...args: any[]) => {
  const prisma: any = getPrismaFromArgs(args);
  const topUsers = await prisma.user.findMany({
    orderBy: { score: 'desc' },
    take: 10,
    select: { username: true, score: true }
  });

  return res.json(topUsers);
};

export const register = async (req: Request, res: Response, ...args: any[]) => {
  const prisma: any = getPrismaFromArgs(args);
  const { username, password } = req.body;
  const { valid, error } = validateCredentials(username, password);
  if (!valid) {
    return res.status(400).json({ error });
  }
  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, password: hashed } });
    const token = createToken({ id: user.id, username: user.username });
    emitTopScores(); // push to WebSocket clients after registration
    return res.status(201).json({ message: 'User registered', user: { id: user.id, username: user.username }, token });
  } catch (error) {
    return res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response, ...args: any[]) => {
  const prisma: any = getPrismaFromArgs(args);
  const { username, password } = req.body;
  const { valid, error } = validateCredentials(username, password);
  if (!valid) {
    return res.status(400).json({ error });
  }
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = createToken({ id: user.id, username: user.username });
    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ error: 'Login failed' });
  }
};
