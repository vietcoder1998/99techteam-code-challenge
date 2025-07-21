import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch {
    return res.sendStatus(403);
  }
};

export function createToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1d' });
}

export function validateCredentials(username?: string, password?: string) {
  if (!username || !password) {
    return { valid: false, error: 'Username and password are required' };
  }
  return { valid: true };
}
