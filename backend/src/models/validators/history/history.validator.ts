import { z } from 'zod';
import { PaginationSchema } from '../common/pagination.validator';
export const HistoryFilterSchema = PaginationSchema.extend({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
