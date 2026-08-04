import { prisma } from '../../config/prisma';

export class DashboardRepository {
  async getDevice(userId: string) {
    return prisma.device.findUnique({ where: { userId } });
  }
  async getUser(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  }
  async getTodaySessions(deviceId: string, startOfDay: Date) {
    return prisma.exposureSession.findMany({
      where: { deviceId, startTime: { gte: startOfDay } }
    });
  }
  async getTodayReadings(deviceId: string, startOfDay: Date) {
    return prisma.uVReading.findMany({
      where: { deviceId, recordedAt: { gte: startOfDay } },
      orderBy: { recordedAt: 'desc' }
    });
  }
  async getLatestSunscreen(userId: string) {
    return prisma.sunscreenApplication.findFirst({
      where: { userId },
      orderBy: { appliedAt: 'desc' }
    });
  }
}
