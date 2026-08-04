"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const analytics_repo_1 = require("../../repositories/analytics/analytics.repo");
const analyticsRepo = new analytics_repo_1.AnalyticsRepository();
class AnalyticsService {
    async getAnalytics(userId, timeframe) {
        const sessions = await analyticsRepo.getSessions(userId);
        const grouped = {};
        sessions.forEach(session => {
            let key;
            const date = new Date(session.startTime);
            if (timeframe === 'daily') {
                key = date.toISOString().split('T')[0];
            }
            else if (timeframe === 'weekly') {
                // Simple week grouping (by ISO week year-week)
                const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                const dayNum = d.getUTCDay() || 7;
                d.setUTCDate(d.getUTCDate() + 4 - dayNum);
                const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
                const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
                key = `${d.getUTCFullYear()}-W${weekNo}`;
            }
            else { // monthly
                key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
            }
            if (!grouped[key]) {
                grouped[key] = { totalTime: 0, totalDose: 0, maxUv: 0, sumAvgUv: 0, count: 0 };
            }
            grouped[key].totalTime += session.durationSeconds;
            grouped[key].totalDose += Number(session.accumulatedSed);
            // We don't have true maxUv per session stored (only averageUvIndex), 
            // but according to the blueprint we can use the highest average or peak. 
            // Let's use averageUvIndex as maxUv proxy for the session if we don't have peak.
            const uv = Number(session.averageUvIndex);
            if (uv > grouped[key].maxUv)
                grouped[key].maxUv = uv;
            grouped[key].sumAvgUv += uv;
            grouped[key].count += 1;
        });
        const data = Object.keys(grouped).sort().map(key => ({
            period: key,
            totalTime: grouped[key].totalTime,
            totalDose: grouped[key].totalDose,
            maxUv: grouped[key].maxUv,
            averageUv: grouped[key].sumAvgUv / grouped[key].count
        }));
        // Calculate trends (compare last two periods)
        let trend = null;
        if (data.length >= 2) {
            const current = data[data.length - 1];
            const previous = data[data.length - 2];
            const doseDiff = current.totalDose - previous.totalDose;
            const dosePct = previous.totalDose > 0 ? (doseDiff / previous.totalDose) * 100 : 100;
            trend = {
                doseDifference: doseDiff,
                dosePercentageChange: dosePct
            };
        }
        return { timeframe, data, trend };
    }
}
exports.AnalyticsService = AnalyticsService;
