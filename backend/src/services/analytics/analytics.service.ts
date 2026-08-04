import { AnalyticsRepository } from '../../repositories/analytics/analytics.repo';
const analyticsRepo = new AnalyticsRepository();

export class AnalyticsService {
  async getAnalytics(userId: string, timeframe: string) {
    const data = await analyticsRepo.getAggregates(userId);
    return { timeframe, data };
  }
}
