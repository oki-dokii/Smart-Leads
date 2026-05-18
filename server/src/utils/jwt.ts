import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload, UserRole } from '../types/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

const getSecret = (): string => {
  const secret = process.env['JWT_SECRET'];
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return secret;
};

const isJwtPayload = (decoded: unknown): decoded is JwtPayload =>
  typeof decoded === 'object' &&
  decoded !== null &&
  'id' in decoded &&
  typeof (decoded as Record<string, unknown>)['id'] === 'string' &&
  'role' in decoded &&
  typeof (decoded as Record<string, unknown>)['role'] === 'string';

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a signed JWT containing `{ id, role }`.
 * Expiry is read from JWT_EXPIRES_IN env var, default 7d.
 */
export const signToken = (id: string, role: UserRole): string => {
  const expiresIn: SignOptions['expiresIn'] =
    (process.env['JWT_EXPIRES_IN'] as SignOptions['expiresIn'] | undefined) ?? '7d';
  const options: SignOptions = { expiresIn };
  return jwt.sign({ id, role }, getSecret(), options);
};

/**
 * Verifies a token string and returns the typed payload.
 * Throws `jwt.JsonWebTokenError` or `jwt.TokenExpiredError` on failure —
 * callers should catch these to map to HTTP responses.
 */
export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, getSecret());

  if (!isJwtPayload(decoded)) {
    throw new jwt.JsonWebTokenError('Invalid token payload');
  }

  return decoded;
};
