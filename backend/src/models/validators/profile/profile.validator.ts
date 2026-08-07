/**
 * ---------------------------------------------------------
 * File: profile.validator.ts
 * Purpose:
 * Zod schemas for validating profile.validator requests.
 * ---------------------------------------------------------
 */

import { z } from 'zod';
// Zod schemas used to validate incoming request payloads.
export const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  skinType: z.number().min(1).max(6).optional(),
  preferredSpf: z.number().min(1).max(100).optional(),
});
