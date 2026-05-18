import { Schema, model, Types } from 'mongoose';
import { ILeadDocument, ILeadModel, LeadStatus, LeadSource } from '../types/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const leadSchema = new Schema<ILeadDocument, ILeadModel>(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    status: {
      type: String,
      enum: {
        values: Object.values(LeadStatus),
        message: `Status must be one of: ${Object.values(LeadStatus).join(', ')}`,
      },
      default: LeadStatus.New,
    },

    source: {
      type: String,
      required: [true, 'Source is required'],
      enum: {
        values: Object.values(LeadSource),
        message: `Source must be one of: ${Object.values(LeadSource).join(', ')}`,
      },
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy (User reference) is required'],
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
    versionKey: false,
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────────────────────

// Fast look-up of leads by status for pipeline/kanban views
leadSchema.index({ status: 1 });

// Scoped queries — "all leads owned by user X"
leadSchema.index({ createdBy: 1 });

// Compound index for paginated, filtered queries
leadSchema.index({ createdBy: 1, status: 1, createdAt: -1 });

// ─────────────────────────────────────────────────────────────────────────────
// Virtual — expose createdBy as a populated User document
// ─────────────────────────────────────────────────────────────────────────────

leadSchema.virtual('owner', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true,
});

// ─────────────────────────────────────────────────────────────────────────────
// Type guard helpers (exported for use in controllers / services)
// ─────────────────────────────────────────────────────────────────────────────

/** Narrows an unknown value to a valid LeadStatus enum member. */
export const isLeadStatus = (value: unknown): value is LeadStatus =>
  Object.values(LeadStatus).includes(value as LeadStatus);

/** Narrows an unknown value to a valid LeadSource enum member. */
export const isLeadSource = (value: unknown): value is LeadSource =>
  Object.values(LeadSource).includes(value as LeadSource);

/** Returns true when createdBy has been populated (is a document, not an ObjectId). */
export const isPopulatedCreatedBy = (
  value: Types.ObjectId | object,
): value is object => !(value instanceof Types.ObjectId);

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

const Lead = model<ILeadDocument, ILeadModel>('Lead', leadSchema);

export default Lead;
