import { Request } from 'express';
import { Types, Document, Model } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export enum UserRole {
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
// Plain data interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILead {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mongoose Document interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface IUserDocument extends IUser, Document {
  comparePassword(candidate: string): Promise<boolean>;
}

export interface ILeadDocument extends ILead, Document {}

// ─────────────────────────────────────────────────────────────────────────────
// Mongoose Model types
// ─────────────────────────────────────────────────────────────────────────────

export type IUserModel = Model<IUserDocument>;
export type ILeadModel = Model<ILeadDocument>;

// ─────────────────────────────────────────────────────────────────────────────
// JWT
// ─────────────────────────────────────────────────────────────────────────────

/** Decoded JWT payload — id and role are always present after signing. */
export interface JwtPayload {
  id: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth request — use as cast in protected route handlers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extends Express Request with a non-optional `user` field.
 * Cast `req` to this type inside handlers that sit behind `verifyToken`.
 */
export interface AuthRequest extends Request {
  user: IUserDocument;
}

// ─────────────────────────────────────────────────────────────────────────────
// Standardised API response envelope
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every route returns this shape.
 *   { success: boolean, message: string, data?: T }
 */
export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility / DTO types
// ─────────────────────────────────────────────────────────────────────────────

/** User object safe to return to clients — no password field. */
export type SafeUser = Omit<IUser, 'password'> & { _id: Types.ObjectId };

export type CreateLeadDTO = Omit<ILead, 'createdAt' | 'updatedAt'>;
export type CreateUserDTO = Omit<IUser, 'createdAt' | 'updatedAt'>;
