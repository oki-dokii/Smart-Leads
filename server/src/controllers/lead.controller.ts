import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Types, FilterQuery } from 'mongoose';
import Lead, { isLeadStatus } from '../models/Lead.js';
import { AppError } from '../middleware/errorHandler.js';
import { buildLeadQuery, LeadQueryParams } from '../utils/queryBuilder.js';
import {
  AuthRequest,
  ApiResponse,
  LeadStatus,
  UserRole,
  ILeadDocument,
} from '../types/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helper to scope single-lead queries based on role
// ─────────────────────────────────────────────────────────────────────────────

const getLeadScope = (user: AuthRequest['user']): FilterQuery<ILeadDocument> => {
  if (user.role === UserRole.Admin) {
    return {};
  }
  return { createdBy: user._id };
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leads/export
// ─────────────────────────────────────────────────────────────────────────────

export const exportLeads = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user } = req as AuthRequest;

    const { filter, sort } = buildLeadQuery({
      userId: user._id,
      role: user.role,
      params: req.query as unknown as LeadQueryParams,
    });

    const leads = await Lead.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .lean();

    const body: ApiResponse<typeof leads> = {
      success: true,
      message: 'Leads exported successfully',
      data: leads,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leads
// ─────────────────────────────────────────────────────────────────────────────

export const getLeads = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user } = req as AuthRequest;

    const { filter, sort, page, limit, skip } = buildLeadQuery({
      userId: user._id,
      role: user.role,
      params: req.query as unknown as LeadQueryParams,
    });

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const body: ApiResponse<{
      leads: typeof leads;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }> = {
      success: true,
      message: 'Leads retrieved successfully',
      data: { leads, total, page, limit, totalPages },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leads/:id
// ─────────────────────────────────────────────────────────────────────────────

export const getLeadById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid lead ID', 400);

    const lead = await Lead.findOne({ _id: id, ...getLeadScope(user) })
      .populate('createdBy', 'name email')
      .lean();

    if (!lead) throw new AppError('Lead not found', 404);

    const body: ApiResponse<typeof lead> = {
      success: true,
      message: 'Lead retrieved successfully',
      data: lead,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/leads
// ─────────────────────────────────────────────────────────────────────────────

export const createLead = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user } = req as AuthRequest;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = {
        success: false,
        message: errors.array().map((e) => e.msg as string).join('; '),
      };
      res.status(400).json(body);
      return;
    }

    const lead = await Lead.create({ ...req.body, createdBy: user._id });

    const body: ApiResponse<typeof lead> = {
      success: true,
      message: 'Lead created successfully',
      data: lead,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/leads/:id
// ─────────────────────────────────────────────────────────────────────────────

export const updateLead = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid lead ID', 400);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = {
        success: false,
        message: errors.array().map((e) => e.msg as string).join('; '),
      };
      res.status(400).json(body);
      return;
    }

    // Strip createdBy — prevents ownership hijacking via PATCH body
    const { createdBy: _discarded, ...safeBody } = req.body as Record<string, unknown>;

    const lead = await Lead.findOneAndUpdate(
      { _id: id, ...getLeadScope(user) },
      { $set: safeBody },
      { new: true, runValidators: true },
    ).lean();

    if (!lead) throw new AppError('Lead not found', 404);

    const body: ApiResponse<typeof lead> = {
      success: true,
      message: 'Lead updated successfully',
      data: lead,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/leads/:id/status
// ─────────────────────────────────────────────────────────────────────────────

export const updateLeadStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;
    const { status } = req.body as { status: unknown };

    if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid lead ID', 400);

    if (!isLeadStatus(status)) {
      throw new AppError(
        `Invalid status. Valid values: ${Object.values(LeadStatus).join(', ')}`,
        400,
      );
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: id, ...getLeadScope(user) },
      { $set: { status } },
      { new: true, runValidators: true },
    ).lean();

    if (!lead) throw new AppError('Lead not found', 404);

    const body: ApiResponse<typeof lead> = {
      success: true,
      message: `Lead status updated to "${status}"`,
      data: lead,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/leads/:id
// ─────────────────────────────────────────────────────────────────────────────

export const deleteLead = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Note: requireRole(UserRole.Admin) middleware is applied on this route,
    // so we know the user is an admin here.
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid lead ID', 400);

    const lead = await Lead.findOneAndDelete({ _id: id });

    if (!lead) throw new AppError('Lead not found', 404);

    const body: ApiResponse = { success: true, message: 'Lead deleted successfully' };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};
