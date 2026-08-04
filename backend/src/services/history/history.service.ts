import { HistoryRepository } from '../../repositories/history/history.repo';
const historyRepo = new HistoryRepository();

export class HistoryService {
  async getHistory(userId: string, page: number, limit: number, startDateStr?: string, endDateStr?: string) {
    if (limit > 100) limit = 100;
    const skip = (page - 1) * limit;
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    const { data, total } = await historyRepo.findMany(userId, skip, limit, startDate, endDate);
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      pagination: {
        page, limit, total, totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    };
  }
  async getSession(userId: string, id: string) {
    const session = await historyRepo.findById(userId, id);
    if (!session) throw new Error('Session not found');
    return session;
  }
}
