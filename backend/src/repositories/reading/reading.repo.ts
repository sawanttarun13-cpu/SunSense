import { prisma } from '../../config/prisma';

export class ReadingRepository {
  async createReading(deviceId: string, uvIndex: number, recordedAt: Date) {
    return prisma.uVReading.create({ data: { deviceId, uvIndex, recordedAt } });
  }

  async getLastReadingBefore(deviceId: string, recordedAt: Date) {
    return prisma.uVReading.findFirst({
      where: { deviceId, recordedAt: { lt: recordedAt } },
      orderBy: { recordedAt: 'desc' }
    });
  }

  async getLastNonZeroReadingBefore(deviceId: string, recordedAt: Date) {
    return prisma.uVReading.findFirst({
      where: { deviceId, uvIndex: { gt: 0 }, recordedAt: { lte: recordedAt } },
      orderBy: { recordedAt: 'desc' }
    });
  }

  async getSessionReadings(deviceId: string, startTime: Date, endTime: Date) {
    return prisma.uVReading.findMany({
      where: { deviceId, recordedAt: { gte: startTime, lte: endTime } },
      orderBy: { recordedAt: 'asc' }
    });
  }
}
