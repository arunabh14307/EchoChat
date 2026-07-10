import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectIdSchema = z
  .string({ required_error: 'Invalid ID' })
  .regex(objectIdRegex, 'Invalid ID format');

export const sendMessageSchema = z.object({
  conversationId: objectIdSchema,
  content: z
    .string({ required_error: 'Content is required' })
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message cannot exceed 5000 characters')
    .trim(),
  replyTo: objectIdSchema.optional(),
});

export const editMessageSchema = z.object({
  content: z
    .string({ required_error: 'Content is required' })
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message cannot exceed 5000 characters')
    .trim(),
});
