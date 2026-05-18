import { Router } from 'express';
import { body } from 'express-validator';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
  exportLeads,
} from '../controllers/lead.controller.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { LeadStatus, LeadSource, UserRole } from '../types/index.js';

const router = Router();

// All lead routes require a valid JWT
router.use(verifyToken);

// ─────────────────────────────────────────────────────────────────────────────
// Validation rule sets
// ─────────────────────────────────────────────────────────────────────────────

const createLeadRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Lead name is required')
    .isLength({ max: 150 })
    .withMessage('Name cannot exceed 150 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('A valid email is required'),

  body('source')
    .isIn(Object.values(LeadSource))
    .withMessage(`Source must be one of: ${Object.values(LeadSource).join(', ')}`),

  body('status')
    .optional()
    .isIn(Object.values(LeadStatus))
    .withMessage(`Status must be one of: ${Object.values(LeadStatus).join(', ')}`),
];

const updateLeadRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be blank'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('A valid email is required'),

  body('source')
    .optional()
    .isIn(Object.values(LeadSource))
    .withMessage(`Source must be one of: ${Object.values(LeadSource).join(', ')}`),

  body('status')
    .optional()
    .isIn(Object.values(LeadStatus))
    .withMessage(`Status must be one of: ${Object.values(LeadStatus).join(', ')}`),
];

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

router.get('/', getLeads);
router.post('/', createLeadRules, createLead);

router.get('/export', exportLeads);
router.get('/:id', getLeadById);
router.patch('/:id', updateLeadRules, updateLead);
router.patch('/:id/status', updateLeadStatus);

// Only admins can permanently delete leads
router.delete('/:id', requireRole(UserRole.Admin), deleteLead);

export default router;
