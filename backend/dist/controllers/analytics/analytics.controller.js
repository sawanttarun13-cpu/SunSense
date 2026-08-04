"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("../../services/analytics/analytics.service");
const apiResponse_1 = require("../../utils/apiResponse");
const analyticsService = new analytics_service_1.AnalyticsService();
class AnalyticsController {
    async get(req, res) {
        try {
            const timeframe = req.query.timeframe || 'daily';
            const result = await analyticsService.getAnalytics(req.userId, timeframe);
            return (0, apiResponse_1.sendSuccess)(res, result);
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 400);
        }
    }
}
exports.AnalyticsController = AnalyticsController;
