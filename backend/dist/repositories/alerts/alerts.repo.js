"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsRepository = void 0;
const prisma_1 = require("../../config/prisma");
class AlertsRepository {
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
    async markAsRead(userId, alertId) {
        return prisma_1.prisma.alert.update({
            where: { id: alertId, userId },
            data: { isRead: true }
        });
    }
}
exports.AlertsRepository = AlertsRepository;
