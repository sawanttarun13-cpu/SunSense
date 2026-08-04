"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const dashboard_repo_1 = require("../../repositories/dashboard/dashboard.repo");
const dashboardRepo = new dashboard_repo_1.DashboardRepository();
class DashboardService {
    async getDashboard(userId) {
        const data = await dashboardRepo.getOverview(userId);
        return {
            status: 'active',
            deviceConnected: !!data.device,
            lastSync: data.device?.lastPing || null,
            todayExposure: 0,
            currentRisk: 'LOW',
        };
    }
}
exports.DashboardService = DashboardService;
