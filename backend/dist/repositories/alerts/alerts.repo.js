"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsRepository = void 0;
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
const prisma_1 = require("../../config/prisma");
class AlertsRepository {
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
    async findMany(userId, skip, take, status) {
        const where = { userId, isDismissed: false };
        if (status === 'read')
            where.isRead = true;
        if (status === 'unread')
            where.isRead = false;
        const [data, total] = await Promise.all([
            prisma_1.prisma.alert.findMany({ where, skip, take, orderBy: { triggeredAt: 'desc' } }),
            prisma_1.prisma.alert.count({ where })
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
    async markAsRead(userId, alertId) {
        return prisma_1.prisma.alert.update({
            where: { id: alertId, userId },
            data: { isRead: true }
        });
    }
    /**
     * Deletes a specific alert permanently.
     */
    async deleteAlert(userId, alertId) {
        return prisma_1.prisma.alert.deleteMany({
            where: { id: alertId, userId }
        });
    }
    /**
     * Returns the total count of active (unread and non-dismissed) alerts.
     */
    async countActiveAlerts(userId) {
        return prisma_1.prisma.alert.count({
            where: { userId, isDismissed: false, isRead: false }
        });
    }
    /**
     * Creates a new alert for a user.
     */
    async createAlert(userId, type, // AlertType
    message, referenceId, triggeredAt = new Date()) {
        return prisma_1.prisma.alert.create({
            data: {
                userId,
                type,
                message,
                referenceId,
                triggeredAt
            }
        });
    }
    /**
     * Gets the most recent alert of a specific type for a user, optionally filtered by a sinceTime (cooldown).
     */
    async getLastAlertOfType(userId, type, sinceTime) {
        const where = { userId, type };
        if (sinceTime) {
            where.triggeredAt = { gte: sinceTime };
        }
        return prisma_1.prisma.alert.findFirst({
            where,
            orderBy: { triggeredAt: 'desc' }
        });
    }
}
exports.AlertsRepository = AlertsRepository;
