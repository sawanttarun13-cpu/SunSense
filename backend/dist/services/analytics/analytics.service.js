"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
/**
 * --------------------------------------------------------
 * File: analytics.service.ts
 * Layer: Service / Business Logic
 *
 * Purpose:
 * Retrieves all exposure sessions for the user and groups
 * them into analytics periods (daily / weekly / monthly).
 * Returns aggregated UV dose, exposure time, peak UV, and
 * average UV per period, along with a trend comparison
 * between the two most recent periods.
 *
 * Why Is This in the Service Layer?
 * The grouping and aggregation logic (ISO week calculation,
 * period key generation, trend percentage calculation) is
 * application-level business logic that belongs here, not
 * in the repository (which only handles raw queries) or
 * the controller (which only handles HTTP concerns).
 *
 * Layer:
 * Business Logic / Aggregation
 *
 * Uses:
 * AnalyticsRepository — Fetches all exposure sessions for the user
 *
 * Does NOT:
 * Access Prisma directly.
 * --------------------------------------------------------
 */
const analytics_repo_1 = require("../../repositories/analytics/analytics.repo");
const analyticsRepo = new analytics_repo_1.AnalyticsRepository();
class AnalyticsService {
    /**
     * Aggregates exposure sessions into a time-series analytics payload.
     *
     * Grouping Keys:
     * - daily:   'YYYY-MM-DD'  (e.g., '2026-08-07')
     * - weekly:  'YYYY-WNN'    (ISO 8601 week, e.g., '2026-W32')
     * - monthly: 'YYYY-MM'     (e.g., '2026-08')
     *
     * For each period, the following metrics are aggregated:
     * - totalTime  → Sum of durationSeconds across all sessions in the period.
     * - totalDose  → Sum of accumulatedSed across all sessions.
     * - maxUv      → Maximum averageUvIndex seen across sessions
     *                (proxy for peak UV — true peak per reading not stored).
     * - averageUv  → Mean of averageUvIndex across sessions.
     *
     * Trend Calculation:
     * Compares the last two periods by UV dose:
     *   doseDifference      = current.totalDose - previous.totalDose
     *   dosePercentageChange = (doseDifference / previous.totalDose) × 100
     *
     * @param userId    - UUID of the authenticated user.
     * @param timeframe - Grouping resolution: 'hourly' | 'daily' | 'weekly' | 'monthly'.
     * @param tzOffset  - Timezone offset in minutes (e.g. from new Date().getTimezoneOffset()). Defaults to 0 (UTC).
     * @returns         { timeframe, data: AnalyticsPeriod[], trend: TrendData | null }
     */
    async getAnalytics(userId, timeframe, tzOffset = 0) {
        const sessions = await analyticsRepo.getSessions(userId);
        // Build a grouped map keyed by the period string
        const grouped = {};
        sessions.forEach(session => {
            let key;
            const date = new Date(session.startTime);
            if (timeframe === 'hourly') {
                // Adjust UTC time by tzOffset to get the user's local time hour
                // tzOffset is the difference, in minutes, from local time to UTC. 
                // e.g., EST is UTC-5 (300 minutes). local = UTC - 300 mins
                const localDate = new Date(date.getTime() - (tzOffset * 60000));
                // Group by hour of day (0-23)
                key = String(localDate.getUTCHours());
            }
            else if (timeframe === 'daily') {
                // Simple YYYY-MM-DD key (Adjusted for local timezone for correct day boundaries)
                const localDate = new Date(date.getTime() - (tzOffset * 60000));
                key = localDate.toISOString().split('T')[0];
            }
            else if (timeframe === 'weekly') {
                // ISO 8601 week number calculation (Adjusted for local timezone)
                const localDate = new Date(date.getTime() - (tzOffset * 60000));
                const d = new Date(Date.UTC(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate()));
                const dayNum = d.getUTCDay() || 7; // Convert Sunday (0) to 7 for ISO compliance
                d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Move to Thursday
                const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
                const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
                key = `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
            }
            else {
                // Monthly: YYYY-MM (Adjusted for local timezone)
                const localDate = new Date(date.getTime() - (tzOffset * 60000));
                key = `${localDate.getUTCFullYear()}-${String(localDate.getUTCMonth() + 1).padStart(2, '0')}`;
            }
            if (!grouped[key]) {
                grouped[key] = { totalTime: 0, totalDose: 0, maxUv: 0, sumAvgUv: 0, count: 0 };
            }
            grouped[key].totalTime += session.durationSeconds;
            grouped[key].totalDose += Number(session.accumulatedSed);
            // Note: averageUvIndex is used as a UV proxy since raw peak is not stored per session.
            // True peak UV tracking per session is scheduled for a future schema enhancement.
            const uv = Number(session.averageUvIndex);
            if (uv > grouped[key].maxUv)
                grouped[key].maxUv = uv;
            grouped[key].sumAvgUv += uv;
            grouped[key].count += 1;
        });
        // For hourly, we want all 24 hours to exist even if there's no data
        if (timeframe === 'hourly') {
            for (let i = 0; i < 24; i++) {
                const key = String(i);
                if (!grouped[key]) {
                    grouped[key] = { totalTime: 0, totalDose: 0, maxUv: 0, sumAvgUv: 0, count: 0 };
                }
            }
        }
        // Sort periods chronologically and compute the averageUv for each
        const data = Object.keys(grouped)
            .sort((a, b) => {
            if (timeframe === 'hourly')
                return parseInt(a, 10) - parseInt(b, 10);
            return a.localeCompare(b);
        })
            .map(key => ({
            period: key,
            totalTime: grouped[key].totalTime,
            totalDose: grouped[key].totalDose,
            maxUv: grouped[key].maxUv,
            averageUv: grouped[key].count > 0 ? grouped[key].sumAvgUv / grouped[key].count : 0
        }));
        // Compare the two most recent periods to show a trend arrow on the frontend
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
