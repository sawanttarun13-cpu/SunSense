/**
 * --------------------------------------------------------
 * File: history.repo.ts
 * Layer: Repository / Data Access
 *
 * Purpose:
 * Provides paginated and optionally date-filtered access to
 * the `exposure_sessions` table for the history page.
 * Uses Promise.all to run the data query and the count query
 * in parallel, reducing total latency.
 *
 * Table Managed:
 * exposure_sessions (read-only)
 *
 * Used By:
 * HistoryService — Paginated session list and single session lookup
 *
 * Performance Notes:
 * - The data query and count query run simultaneously via Promise.all.
 * - Filtered by userId to prevent users from accessing other users' sessions.
 * - The (user_id) index on exposure_sessions ensures these queries are fast.
 * --------------------------------------------------------
 */
import { prisma } from '../../config/prisma';

export class HistoryRepository {

  /**
   * Returns a paginated page of exposure sessions with an optional date filter.
   *
   * Results are ordered by start_time descending (most recent first).
   * Also returns the total count for the same filter (without pagination)
   * so the HistoryService can compute total pages.
   *
   * @param userId    - UUID of the authenticated user (mandatory scope filter).
   * @param skip      - Number of records to skip (offset for the current page).
   * @param take      - Number of records to return (page size).
   * @param startDate - Optional: only return sessions that started on or after this date.
   * @param endDate   - Optional: only return sessions that started on or before this date.
   * @returns         { data: ExposureSession[], total: number }
   */
  async findMany(userId: string, skip: number, take: number, startDate?: Date, endDate?: Date) {
    // Build the optional date range filter dynamically
    const where: any = { userId };
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = startDate;
      if (endDate) where.startTime.lte = endDate;
    }

    // Run data fetch and count in parallel to minimise latency
    const [data, total] = await Promise.all([
      prisma.exposureSession.findMany({ where, skip, take, orderBy: { startTime: 'desc' } }),
      prisma.exposureSession.count({ where })
    ]);

    return { data, total };
  }

  /**
   * Returns a single exposure session scoped to the authenticated user.
   *
   * The userId scope prevents users from reading sessions belonging
   * to other users by guessing UUIDs.
   *
   * @param userId - UUID of the authenticated user.
   * @param id     - UUID (sessionId) of the session to retrieve.
   * @returns      The ExposureSession, or null if not found or not owned by the user.
   */
  async findById(userId: string, id: string) {
    return prisma.exposureSession.findFirst({ where: { sessionId: id, userId } });
  }
}
