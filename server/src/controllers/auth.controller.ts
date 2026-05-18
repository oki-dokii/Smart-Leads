import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { signToken } from '../utils/jwt.js';
import {
  AuthRequest,
  ApiResponse,
  SafeUser,
  IUser,
  UserRole,
} from '../types/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

const toSafeUser = (user: IUser & { _id: Types.ObjectId }): SafeUser => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

type AuthData = { token: string; user: SafeUser };

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = {
        success: false,
        message: errors
          .array()
          .map((e) => e.msg as string)
          .join('; '),
      };
      res.status(400).json(body);
      return;
    }

    const { name, email, password, role } = req.body as {
      name: string;
      email: string;
      password: string;
      role?: UserRole;
    };

    const user = await User.create({ name, email, password, role });
    const token = signToken(String(user._id), user.role);

    const body: ApiResponse<AuthData> = {
      success: true,
      message: 'Account created successfully',
      data: { token, user: toSafeUser(user) },
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = {
        success: false,
        message: errors
          .array()
          .map((e) => e.msg as string)
          .join('; '),
      };
      res.status(400).json(body);
      return;
    }

    const { email, password } = req.body as { email: string; password: string };

    // password has select:false in schema — must opt-in explicitly
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = signToken(String(user._id), user.role);

    const body: ApiResponse<AuthData> = {
      success: true,
      message: 'Login successful',
      data: { token, user: toSafeUser(user) },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me  (protected — runs after verifyToken)
// ─────────────────────────────────────────────────────────────────────────────

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user } = req as AuthRequest;

    const body: ApiResponse<SafeUser> = {
      success: true,
      message: 'Authenticated user retrieved',
      data: toSafeUser(user),
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};
