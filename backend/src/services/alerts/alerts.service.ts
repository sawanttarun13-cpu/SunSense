import { AlertsRepository } from '../../repositories/alerts/alerts.repo';
const alertsRepo = new AlertsRepository();

export class AlertsService {
  async getAlerts(userId: string, page: number, limit: number, status: string) {
    const skip = (page - 1) * limit;
    const { data, total } = await alertsRepo.findMany(userId, skip, limit, status);
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
  async markRead(userId: string, alertId: string) {
    await alertsRepo.markAsRead(userId, alertId);
    return { success: true };
  }
}
