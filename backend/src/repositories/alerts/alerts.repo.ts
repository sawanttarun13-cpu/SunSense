import { prisma } from '../../config/prisma';

export class AlertsRepository {
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

  async markAsRead(userId: string, alertId: string) {
    return prisma.alert.update({
      where: { id: alertId, userId },
      data: { isRead: true }
    });
  }
}
