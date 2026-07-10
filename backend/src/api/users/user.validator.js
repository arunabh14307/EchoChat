import { z } from 'zod';

/**
 * User Zod schemas — validates profile updates.
 */

export const updateUserSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name cannot be empty')
    .max(50, 'Display name cannot exceed 50 characters')
    .optional(),

  bio: z
    .string()
    .max(200, 'Bio cannot exceed 200 characters')
    .optional(),

  gender: z
    .enum(['male', 'female', 'other', 'prefer_not_to_say', ''])
    .optional(),

  dateOfBirth: z
    .string()
    .datetime({ precision: 3, offset: true, message: 'Invalid Date of Birth format' })
    .nullable()
    .or(z.date())
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'))
    .optional(),

  privacy: z
    .enum(['public', 'private'])
    .optional(),

  notificationSettings: z
    .object({
      enableSound: z.boolean().optional(),
      enableBrowser: z.boolean().optional(),
      doNotDisturb: z.boolean().optional(),
      muteGroups: z.boolean().optional(),
      muteDirect: z.boolean().optional(),
    })
    .optional(),
});
