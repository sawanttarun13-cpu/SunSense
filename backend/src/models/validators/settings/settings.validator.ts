/**
 * ---------------------------------------------------------
 * File: settings.validator.ts
 * Purpose:
 * Zod schemas for validating settings.validator requests.
 * ---------------------------------------------------------
 */

import { z } from 'zod';
// Zod schemas used to validate incoming request payloads.
export const UpdateSettingsSchema = z.object({
  alertThreshold: z.number().min(0.1).max(20.0).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});
