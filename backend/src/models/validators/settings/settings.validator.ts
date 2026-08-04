import { z } from 'zod';
export const UpdateSettingsSchema = z.object({
  alertThreshold: z.number().min(0.1).max(20.0).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});
