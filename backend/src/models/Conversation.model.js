import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['direct', 'group'],
      default: 'direct',
      required: true,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    // Group-only fields
    name: {
      type: String,
      trim: true,
      maxlength: [50, 'Group name cannot exceed 50 characters'],
    },
    groupDescription: {
      type: String,
      trim: true,
      maxlength: [500, 'Group description cannot exceed 500 characters'],
      default: '',
    },
    groupAvatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    inviteCode: {
      code: {
        type: String,
        sparse: true,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },
    // Message metadata
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    // Per-user unread counts
    unreadCounts: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        count: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
    // Per-user toggles
    pinnedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    archivedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    mutedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────
// Lookup chats by participants
conversationSchema.index({ participants: 1 });
// Sort conversations by last activity or pinning
conversationSchema.index({ lastMessageAt: -1 });
// Lookup groups by invite code
conversationSchema.index({ 'inviteCode.code': 1 }, { sparse: true });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
