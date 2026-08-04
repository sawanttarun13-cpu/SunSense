import { prisma } from '../../config/prisma';

export class AnalyticsRepository {
  async getSessions(userId: string) {
    return prisma.exposureSession.findMany({
      where: { userId },
      orderBy: { startTime: 'asc' }
    });
  }
}
