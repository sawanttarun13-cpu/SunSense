import { z } from 'zod';
export const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  skinType: z.number().min(1).max(6).optional(),
  preferredSpf: z.number().min(1).max(100).optional(),
});
