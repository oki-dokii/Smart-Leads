import { FilterQuery, SortOrder } from 'mongoose';
import { ILeadDocument, LeadSource, LeadStatus, UserRole } from '../types/index.js';
import { Types } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Raw query-string parameters accepted by GET /api/leads */
export interface LeadQueryParams {
  status?: string;
  source?: string;
  search?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

/** Context needed to scope the query correctly per role */
export interface LeadQueryOptions {
  userId: Types.ObjectId;
  role: UserRole;
  params: LeadQueryParams;
}

/** Everything the controller needs to execute the Mongoose query */
export interface LeadQueryResult {
  filter: FilterQuery<ILeadDocument>;
  sort: Record<string, SortOrder>;
  page: number;
  limit: number;
  skip: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Guards (duplicated here so queryBuilder has no model dependency)
// ─────────────────────────────────────────────────────────────────────────────

const isValidStatus = (v: string): v is LeadStatus =>
  Object.values(LeadStatus).includes(v as LeadStatus);

const isValidSource = (v: string): v is LeadSource =>
  Object.values(LeadSource).includes(v as LeadSource);

// ─────────────────────────────────────────────────────────────────────────────
// Escape user input so it is safe to embed in a RegExp
// Prevents ReDoS attacks from crafted search strings
// ─────────────────────────────────────────────────────────────────────────────

const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ─────────────────────────────────────────────────────────────────────────────
// buildLeadQuery
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Composes a Mongoose FilterQuery from the incoming request context.
 *
 * Scoping rules:
 *  - UserRole.Sales  → scoped to their own leads (createdBy = userId)
 *  - UserRole.Admin  → all leads (no createdBy filter)
 *
 * All filters (status, source, search) compose together via $and / field-level.
 */
export const buildLeadQuery = (options: LeadQueryOptions): LeadQueryResult => {
  const { userId, role, params } = options;
  const {
    status,
    source,
    search,
    sort = 'latest',
    page = '1',
    limit = '10',
  } = params;

  // Start with an empty filter; conditionally add each clause
  const filter: FilterQuery<ILeadDocument> = {};

  // ── Ownership scope ──────────────────────────────────────────────────────
  if (role === UserRole.Sales) {
    filter['createdBy'] = userId;
  }

  // ── Status filter ────────────────────────────────────────────────────────
  if (status !== undefined && status !== '' && isValidStatus(status)) {
    filter['status'] = status;
  }

  // ── Source filter ────────────────────────────────────────────────────────
  if (source !== undefined && source !== '' && isValidSource(source)) {
    filter['source'] = source;
  }

  // ── Text search (name OR email, case-insensitive) ────────────────────────
  const trimmedSearch = search?.trim() ?? '';
  if (trimmedSearch.length > 0) {
    const pattern = new RegExp(escapeRegex(trimmedSearch), 'i');
    filter['$or'] = [{ name: { $regex: pattern } }, { email: { $regex: pattern } }];
  }

  // ── Sort ─────────────────────────────────────────────────────────────────
  const sortOrder: SortOrder = sort === 'oldest' ? 1 : -1;
  const sortField: Record<string, SortOrder> = { createdAt: sortOrder };

  // ── Pagination ───────────────────────────────────────────────────────────
  const pageNum = Math.max(1, Number.isFinite(+page) ? Math.floor(+page) : 1);
  const limitNum = Math.min(100, Math.max(1, Number.isFinite(+limit) ? Math.floor(+limit) : 10));
  const skip = (pageNum - 1) * limitNum;

  return {
    filter,
    sort: sortField,
    page: pageNum,
    limit: limitNum,
    skip,
  };
};
