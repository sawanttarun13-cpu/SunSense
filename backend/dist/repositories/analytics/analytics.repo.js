"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRepository = void 0;
/**
 * --------------------------------------------------------
 * File: analytics.repo.ts
 * Layer: Repository / Data Access
 *
 * Purpose:
 * Provides the database query for fetching all exposure
 * sessions belonging to a user, ordered chronologically.
 * The AnalyticsService then groups these sessions by day,
 * week, or month to produce the analytics time series.
 *
 * Table Managed:
 * exposure_sessions (read-only)
 *
 * Used By:
 * AnalyticsService — Fetches all sessions for grouping/aggregation
 *
 * Performance Notes:
 * - Queries the (user_id) index on exposure_sessions.
 * - No date range filter is applied here because AnalyticsService
 *   needs the full history to produce trend comparisons.
 *   For large datasets, consider adding pagination in a future phase.
 * --------------------------------------------------------
 */
const prisma_1 = require("../../config/prisma");
class AnalyticsRepository {
    /**
     * Returns all exposure sessions for a user, sorted oldest-first.
     *
     * Ascending order is required so the AnalyticsService can
     * generate chronological period keys and correctly compute
     * the "previous vs. current period" trend comparison.
     *
     * @param userId - UUID of the authenticated user.
     * @returns      Array of all ExposureSessions for the user, sorted by startTime asc.
     */
    async getSessions(userId) {
        return prisma_1.prisma.exposureSession.findMany({
            where: { userId },
            orderBy: { startTime: 'asc' }
        });
    }
}
exports.AnalyticsRepository = AnalyticsRepository;
