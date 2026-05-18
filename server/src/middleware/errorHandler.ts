import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { MongoServerError } from 'mongodb';
import { ApiResponse } from '../types/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Typed application error
// ─────────────────────────────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 404 handler — register after all routes
// ─────────────────────────────────────────────────────────────────────────────

export const notFound = (req: Request, res: Response, _next: NextFunction): void => {
  const body: ApiResponse = {
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  };
  res.status(404).json(body);
};

// ─────────────────────────────────────────────────────────────────────────────
// Global error handler — must be the LAST middleware (4 params)
// ─────────────────────────────────────────────────────────────────────────────

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const respond = (statusCode: number, message: string): void => {
    const body: ApiResponse = { success: false, message };
    res.status(statusCode).json(body);
  };

  // ── Known operational error ────────────────────────────────────────────────
  if (err instanceof AppError) {
    respond(err.statusCode, err.message);
    return;
  }

  // ── Mongoose validation error ──────────────────────────────────────────────
  if (err instanceof MongooseError.ValidationError) {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
    respond(400, message);
    return;
  }

  // ── Mongoose cast error (invalid ObjectId) ─────────────────────────────────
  if (err instanceof MongooseError.CastError) {
    respond(400, `Invalid value for field '${err.path}': ${String(err.value)}`);
    return;
  }

  // ── MongoDB duplicate key (E11000) ─────────────────────────────────────────
  if (err instanceof MongoServerError && err.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? 'field';
    respond(409, `A record with this ${field} already exists`);
    return;
  }

  // ── Unknown / programming error ────────────────────────────────────────────
  const message = err instanceof Error ? err.message : 'Internal server error';
  console.error('[error]', err);
  respond(500, message);
};
