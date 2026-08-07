/**
 * ---------------------------------------------------------
 * File: pagination.validator.ts
 * Purpose:
 * Zod schemas for validating pagination.validator requests.
 * ---------------------------------------------------------
 */

import { z } from 'zod';
// Zod schemas used to validate incoming request payloads.
export const PaginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});
