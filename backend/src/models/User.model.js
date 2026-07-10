import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Username must be at least 2 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores'],
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [50, 'Display name cannot exceed 50 characters'],
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Never returned in queries by default
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }, // Cloudinary public_id for deletion
    },
    coverPhoto: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: '',
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say', ''],
      default: '',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    privacy: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'away'],
      default: 'offline',
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    notificationSettings: {
      enableSound: { type: Boolean, default: true },
      enableBrowser: { type: Boolean, default: true },
      doNotDisturb: { type: Boolean, default: false },
      muteGroups: { type: Boolean, default: false },
      muteDirect: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────
// Single text index supporting search by username or display name
userSchema.index({ username: 'text', displayName: 'text' });

// ── Pre-save hook: hash password ──────────────────────────────
userSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
  // Default displayName to username if empty
  if (!this.displayName) {
    this.displayName = this.username;
  }
  next();
});

// ── Instance method: compare password ────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// ── Virtual: avatar URL fallback ──────────────────────────────
userSchema.virtual('avatarUrl').get(function () {
  return (
    this.avatar?.url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.username)}`
  );
});

// ── Virtual: cover photo URL fallback ─────────────────────────
userSchema.virtual('coverPhotoUrl').get(function () {
  return this.coverPhoto?.url || '';
});

const User = mongoose.model('User', userSchema);
export default User;
