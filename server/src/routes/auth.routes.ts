import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// Validation rule sets
// ─────────────────────────────────────────────────────────────────────────────

const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('A valid email is required'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),

  body('role')
    .optional()
    .isIn(['admin', 'sales'])
    .withMessage('Role must be "admin" or "sales"'),
];

const loginRules = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('A valid email is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.get('/me', verifyToken, getMe);

export default router;
