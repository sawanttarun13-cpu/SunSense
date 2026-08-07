/**
 * ---------------------------------------------------------
 * File: readings.validator.ts
 * Purpose:
 * Zod schemas for validating readings.validator requests.
 * ---------------------------------------------------------
 */

import { z } from 'zod';
// Zod schemas used to validate incoming request payloads.
export const ReadingsPayloadSchema = z.object({
  readings: z.array(z.object({
    uvIndex: z.number().min(0).max(30),
    recordedAt: z.string().datetime()
  }))
});
