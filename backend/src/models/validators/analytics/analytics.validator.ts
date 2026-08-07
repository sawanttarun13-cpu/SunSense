/**
 * ---------------------------------------------------------
 * File: analytics.validator.ts
 * Purpose:
 * Zod schemas for validating analytics.validator requests.
 * ---------------------------------------------------------
 */

import { z } from 'zod';
// Zod schemas used to validate incoming request payloads.
export const AnalyticsFilterSchema = z.object({
  timeframe: z.enum(['daily', 'weekly', 'monthly']).optional(),
});
