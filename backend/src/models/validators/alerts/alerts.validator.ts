/**
 * ---------------------------------------------------------
 * File: alerts.validator.ts
 * Purpose:
 * Zod schemas for validating alerts.validator requests.
 * ---------------------------------------------------------
 */

import { z } from 'zod';
import { PaginationSchema } from '../common/pagination.validator';
// Zod schemas used to validate incoming request payloads.
export const AlertFilterSchema = PaginationSchema.extend({
  status: z.enum(['read', 'unread', 'all']).optional(),
});
