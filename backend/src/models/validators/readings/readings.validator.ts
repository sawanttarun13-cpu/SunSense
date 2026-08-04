import { z } from 'zod';
export const ReadingsPayloadSchema = z.object({
  readings: z.array(z.object({
    uvIndex: z.number().min(0).max(30),
    recordedAt: z.string().datetime()
  }))
});
