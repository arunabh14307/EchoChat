import { z } from 'zod';

export const getNotificationsQuerySchema = z.object({
  query: z.object({
    page: z
      .preprocess((val) => (val ? parseInt(val) : undefined), z.number().int().min(1))
      .optional()
      .default(1),
    limit: z
      .preprocess((val) => (val ? parseInt(val) : undefined), z.number().int().min(1).max(100))
      .optional()
      .default(20),
  }),
});
