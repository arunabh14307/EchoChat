import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid User ID format');

export const createGroupSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Group name is required' })
      .min(1, 'Group name cannot be empty')
      .max(50, 'Group name cannot exceed 50 characters'),
    description: z
      .string()
      .max(500, 'Group description cannot exceed 500 characters')
      .optional()
      .default(''),
    memberIds: z
      .preprocess(
        (val) => (typeof val === 'string' ? JSON.parse(val) : val),
        z.array(objectIdSchema)
      )
      .optional()
      .default([]),
  }),
});

export const updateGroupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Group name cannot be empty')
      .max(50, 'Group name cannot exceed 50 characters')
      .optional(),
    description: z
      .string()
      .max(500, 'Group description cannot exceed 500 characters')
      .optional(),
  }),
});

export const addMembersSchema = z.object({
  body: z.object({
    userIds: z
      .preprocess(
        (val) => (typeof val === 'string' ? JSON.parse(val) : val),
        z.array(objectIdSchema).nonempty('Please specify at least one member to add')
      ),
  }),
});

export const joinGroupSchema = z.object({
  body: z.object({
    inviteCode: z
      .string({ required_error: 'Invite code is required' })
      .min(1, 'Invite code cannot be empty'),
  }),
});

export const regenerateInviteSchema = z.object({
  body: z.object({
    expiry: z
      .enum(['never', '24h', '7d', '30d'], {
        invalid_type_error: "Expiry must be 'never', '24h', '7d', or '30d'",
      })
      .optional()
      .default('never'),
  }),
});
