import { prisma } from '../../config/prisma';

export class HistoryRepository {
  async findMany(userId: string, skip: number, take: number, startDate?: Date, endDate?: Date) {
    const where: any = { userId };
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = startDate;
      if (endDate) where.startTime.lte = endDate;
    }

    const [data, total] = await Promise.all([
      prisma.exposureSession.findMany({ where, skip, take, orderBy: { startTime: 'desc' } }),
      prisma.exposureSession.count({ where })
    ]);
    return { data, total };
  }

  async findById(userId: string, id: string) {
    return prisma.exposureSession.findFirst({ where: { sessionId: id, userId } });
  }
}


