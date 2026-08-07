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
import { AnalyticsRepository } from '../../repositories/analytics/analytics.repo';

const analyticsRepo = new AnalyticsRepository();

export class AnalyticsService {

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
   * @param timeframe - Grouping resolution: 'daily' | 'weekly' | 'monthly'.
   * @returns         { timeframe, data: AnalyticsPeriod[], trend: TrendData | null }
   */
  async getAnalytics(userId: string, timeframe: string) {
    const sessions = await analyticsRepo.getSessions(userId);

    // Build a grouped map keyed by the period string
    const grouped: Record<string, { totalTime: number; totalDose: number; maxUv: number; sumAvgUv: number; count: number }> = {};
    
    sessions.forEach(session => {
      let key: string;
      const date = new Date(session.startTime);

      if (timeframe === 'daily') {
        // Simple YYYY-MM-DD key
        key = date.toISOString().split('T')[0];

      } else if (timeframe === 'weekly') {
        // ISO 8601 week number calculation:
        // 1. Find the nearest Thursday to the date (ISO weeks are Thursday-anchored)
        // 2. Get the UTC year-start for that Thursday's year
        // 3. Calculate which week number the Thursday falls in
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7; // Convert Sunday (0) to 7 for ISO compliance
        d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Move to Thursday
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
        key = `${d.getUTCFullYear()}-W${weekNo}`;

      } else {
        // Monthly: YYYY-MM
        key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[key]) {
        grouped[key] = { totalTime: 0, totalDose: 0, maxUv: 0, sumAvgUv: 0, count: 0 };
      }

      grouped[key].totalTime += session.durationSeconds;
      grouped[key].totalDose += Number(session.accumulatedSed);

      // Note: averageUvIndex is used as a UV proxy since raw peak is not stored per session.
      // True peak UV tracking per session is scheduled for a future schema enhancement.
      const uv = Number(session.averageUvIndex);
      if (uv > grouped[key].maxUv) grouped[key].maxUv = uv;
      grouped[key].sumAvgUv += uv;
      grouped[key].count += 1;
    });

    // Sort periods chronologically and compute the averageUv for each
    const data = Object.keys(grouped).sort().map(key => ({
      period: key,
      totalTime: grouped[key].totalTime,
      totalDose: grouped[key].totalDose,
      maxUv: grouped[key].maxUv,
      averageUv: grouped[key].sumAvgUv / grouped[key].count
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
