"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const analytics_repo_1 = require("../../repositories/analytics/analytics.repo");
const analyticsRepo = new analytics_repo_1.AnalyticsRepository();
class AnalyticsService {
    async getAnalytics(userId, timeframe) {
        const data = await analyticsRepo.getAggregates(userId);
        return { timeframe, data };
    }
}
exports.AnalyticsService = AnalyticsService;
