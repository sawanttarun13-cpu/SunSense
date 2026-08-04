import { z } from 'zod';
export const AnalyticsFilterSchema = z.object({
  timeframe: z.enum(['daily', 'weekly', 'monthly']).optional(),
});
