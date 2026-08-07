/**
 * ---------------------------------------------------------
 * File: history.validator.ts
 * Purpose:
 * Zod schemas for validating history.validator requests.
 * ---------------------------------------------------------
 */

import { z } from 'zod';
import { PaginationSchema } from '../common/pagination.validator';
// Zod schemas used to validate incoming request payloads.
export const HistoryFilterSchema = PaginationSchema.extend({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
