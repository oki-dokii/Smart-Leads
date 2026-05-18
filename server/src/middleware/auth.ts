import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AuthRequest, ApiResponse } from '../types/index.js';
import { verifyToken as verifyJwt } from '../utils/jwt.js';

// ─────────────────────────────────────────────────────────────────────────────
// verifyToken — Bearer JWT middleware
// Attaches the authenticated user to req as AuthRequest.user
// ─────────────────────────────────────────────────────────────────────────────

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    const body: ApiResponse = { success: false, message: 'No token provided' };
    res.status(401).json(body);
    return;
  }

  const token = authHeader.split(' ')[1] ?? '';

  try {
    const payload = verifyJwt(token);

    const user = await User.findById(payload.id);
    if (!user) {
      const body: ApiResponse = { success: false, message: 'User no longer exists' };
      res.status(401).json(body);
      return;
    }

    // Safe cast — we have confirmed the user exists; handlers receive AuthRequest
    (req as AuthRequest).user = user;
    next();
  } catch (err) {
    const message =
      err instanceof jwt.TokenExpiredError
        ? 'Token expired'
        : 'Invalid token';

    const body: ApiResponse = { success: false, message };
    res.status(401).json(body);
  }
};
