/**
 * --------------------------------------------------------
 * File: alerts.repo.ts
 * Layer: Repository / Data Access
 *
 * Purpose:
 * Provides paginated and status-filtered read access to the
 * `alerts` table, and allows marking individual alerts as read.
 * All queries are scoped to a specific user and automatically
 * exclude dismissed alerts.
 *
 * Table Managed:
 * alerts
 *
 * Used By:
 * AlertsService — Paginated alert list and mark-as-read operation
 *
 * Performance Notes:
 * - Filtered by user_id, using the (user_id) index on alerts.
 * - isDismissed: false is always applied so dismissed alerts
 *   never appear in results without re-querying the full table.
 * --------------------------------------------------------
 */
import { prisma } from '../../config/prisma';

export class AlertsRepository {

  /**
   * Returns a paginated page of non-dismissed alerts for a user.
   *
   * The status filter narrows results further:
   * - 'all'    → All non-dismissed alerts (default)
   * - 'read'   → Only alerts where isRead = true
   * - 'unread' → Only alerts where isRead = false
   *
   * Results are ordered by triggeredAt descending (newest first).
   * Total count is fetched in parallel for pagination metadata.
   *
   * @param userId - UUID of the authenticated user.
   * @param skip   - Number of records to skip (page offset).
   * @param take   - Number of records per page.
   * @param status - Filter string: 'all' | 'read' | 'unread'.
   * @returns      { data: Alert[], total: number }
   */
  async findMany(userId: string, skip: number, take: number, status: string) {
    const where: any = { userId, isDismissed: false };
    if (status === 'read') where.isRead = true;
    if (status === 'unread') where.isRead = false;

    const [data, total] = await Promise.all([
      prisma.alert.findMany({ where, skip, take, orderBy: { triggeredAt: 'desc' } }),
      prisma.alert.count({ where })
    ]);

    return { data, total };
  }

  /**
   * Marks a specific alert as read.
   *
   * Scoped to the user so that only the alert owner can mark
   * it as read. Uses Prisma's compound where clause (id + userId)
   * as a security guard against unauthorized modification.
   *
   * @param userId  - UUID of the authenticated user.
   * @param alertId - UUID of the alert to mark as read.
   * @returns       The updated Alert record.
   */
  async markAsRead(userId: string, alertId: string) {
    return prisma.alert.update({
      where: { id: alertId, userId },
      data: { isRead: true }
    });
  }
}
