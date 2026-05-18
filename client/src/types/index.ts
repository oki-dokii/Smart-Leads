// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export enum Role {
  Admin = 'admin',
  Sales = 'sales',
}

export enum LeadStatus {
  New = 'New',
  Contacted = 'Contacted',
  Qualified = 'Qualified',
  Lost = 'Lost',
}

export enum LeadSource {
  Website = 'Website',
  Instagram = 'Instagram',
  Referral = 'Referral',
}

// ─────────────────────────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface ILead {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: IUser | string; // Could be populated or just ObjectId string
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Responses
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  leads: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Query Parameters & Filters
// ─────────────────────────────────────────────────────────────────────────────

export interface LeadFilters {
  status?: LeadStatus | '';
  source?: LeadSource | '';
  search?: string;
  sort?: 'latest' | 'oldest';
  page?: number;
  limit?: number;
}
