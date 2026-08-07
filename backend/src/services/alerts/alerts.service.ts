/**
 * --------------------------------------------------------
 * File: alerts.service.ts
 * Layer: Service / Business Logic
 *
 * Purpose:
 * Provides paginated access to the user's smart alerts.
 * Supports filtering by read/unread status. Also handles
 * marking an individual alert as read.
 *
 * Note on Alert Generation:
 * This service only READS alerts. The smart alert generation
 * engine (which creates alerts based on UV thresholds, battery
 * levels, and sunscreen expiry) is a separate system
 * scheduled for implementation in Phase 8.
 *
 * Layer:
 * Business Logic
 *
 * Uses:
 * AlertsRepository — Queries the alerts table
 *
 * Does NOT:
 * Access Prisma directly.
 * --------------------------------------------------------
 */
import { AlertsRepository } from '../../repositories/alerts/alerts.repo';

const alertsRepo = new AlertsRepository();

export class AlertsService {

  /**
   * Returns a paginated list of smart alerts for the user.
   *
   * Dismissed alerts are always excluded from results.
   * The status filter controls whether to show all, only
   * read, or only unread alerts.
   *
   * @param userId - UUID of the authenticated user.
   * @param page   - 1-indexed page number.
   * @param limit  - Number of alerts per page.
   * @param status - Filter: 'all' | 'read' | 'unread'. Default is 'all'.
   * @returns      { data: Alert[], pagination: PaginationMeta }
   */
  async getAlerts(userId: string, page: number, limit: number, status: string) {
    const skip = (page - 1) * limit;
    const { data, total } = await alertsRepo.findMany(userId, skip, limit, status);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    };
  }

  /**
   * Marks a specific alert as read.
   *
   * Scoped to the authenticated user so that a user cannot
   * mark another user's alert as read by guessing an alert UUID.
   *
   * @param userId  - UUID of the authenticated user.
   * @param alertId - UUID of the alert to mark as read.
   * @returns       { success: true }
   */
  async markRead(userId: string, alertId: string) {
    await alertsRepo.markAsRead(userId, alertId);
    return { success: true };
  }
}
