import { z } from 'zod';
import { PaginationSchema } from '../common/pagination.validator';
export const AlertFilterSchema = PaginationSchema.extend({
  status: z.enum(['read', 'unread', 'all']).optional(),
});
