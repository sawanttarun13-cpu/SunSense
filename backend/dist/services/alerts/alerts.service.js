"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const alerts_repo_1 = require("../../repositories/alerts/alerts.repo");
const alertsRepo = new alerts_repo_1.AlertsRepository();
class AlertsService {
    async getAlerts(userId, page, limit, status) {
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
    async markRead(userId, alertId) {
        await alertsRepo.markAsRead(userId, alertId);
        return { success: true };
    }
}
exports.AlertsService = AlertsService;
