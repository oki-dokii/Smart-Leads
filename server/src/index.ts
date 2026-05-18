import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import leadRoutes from './routes/lead.routes.js';
import { notFound, globalErrorHandler } from './middleware/errorHandler.js';
import { ApiResponse } from './types/index.js';

dotenv.config();

const app: Application = express();
const PORT = process.env['PORT'] ?? 5000;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────

app.use(cors({ origin: process.env['CLIENT_URL'] ?? 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/health', (_req: Request, res: Response) => {
  const body: ApiResponse<{ timestamp: string }> = {
    success: true,
    message: 'Server is running',
    data: { timestamp: new Date().toISOString() },
  };
  res.json(body);
});

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// Error handlers — must be last
// ─────────────────────────────────────────────────────────────────────────────

app.use(notFound);
app.use(globalErrorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────────────────────────────────────

const start = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] Running on http://localhost:${PORT}`);
  });
};

start().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[server] Failed to start: ${message}`);
  process.exit(1);
});

export default app;
