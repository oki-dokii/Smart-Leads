import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserDocument, IUserModel, UserRole } from '../types/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned in queries by default
    },

    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: `Role must be one of: ${Object.values(UserRole).join(', ')}`,
      },
      default: UserRole.Sales,
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

userSchema.index({ email: 1 }, { unique: true });

// ─────────────────────────────────────────────────────────────────────────────
// Pre-save hook — hash password on create / change
// ─────────────────────────────────────────────────────────────────────────────

userSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();

  const SALT_ROUNDS = 10;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// Instance method — password comparison
// ─────────────────────────────────────────────────────────────────────────────

userSchema.methods.comparePassword = async function (
  this: IUserDocument,
  candidate: string,
): Promise<boolean> {
  // password has select:false, so it is only available when explicitly selected
  return bcrypt.compare(candidate, this.password);
};

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

const User = model<IUserDocument, IUserModel>('User', userSchema);

export default User;
