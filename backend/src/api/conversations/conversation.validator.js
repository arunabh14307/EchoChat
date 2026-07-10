import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectIdSchema = z
  .string({ required_error: 'Invalid ID' })
  .regex(objectIdRegex, 'Invalid ID format');

export const createConversationSchema = z.object({
  recipientId: objectIdSchema,
});

export const toggleStateSchema = z.object({
  state: z.boolean({ required_error: 'State parameter must be a boolean (true/false)' }),
});

export const createGroupSchema = z.object({
  name: z
    .string({ required_error: 'Group name is required' })
    .min(1, 'Group name cannot be empty')
    .max(50, 'Group name cannot exceed 50 characters')
    .trim(),
  memberIds: z
    .array(objectIdSchema)
    .min(1, 'Group must have at least one member besides the creator'),
});
