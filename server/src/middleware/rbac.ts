import { Request, Response, NextFunction } from 'express';
import { AuthRequest, UserRole, ApiResponse } from '../types/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// requireRole — RBAC middleware factory
//
// Usage (always chain after verifyToken):
//   router.delete('/:id', verifyToken, requireRole(UserRole.Admin), handler)
// ─────────────────────────────────────────────────────────────────────────────

export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;

    if (!authReq.user || !roles.includes(authReq.user.role)) {
      const body: ApiResponse = {
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      };
      res.status(403).json(body);
      return;
    }

    next();
  };
