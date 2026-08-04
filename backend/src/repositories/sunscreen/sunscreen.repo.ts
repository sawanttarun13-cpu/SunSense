import { prisma } from '../../config/prisma';

export class SunscreenRepository {
  async createApplication(userId: string, appliedSpf: number, appliedAt: Date, expiresAt: Date) {
    return prisma.sunscreenApplication.create({
      data: { userId, appliedSpf, appliedAt, expiresAt }
    });
  }

  async getActiveApplication(userId: string) {
    return prisma.sunscreenApplication.findFirst({
      where: { userId },
      orderBy: { appliedAt: 'desc' }
    });
  }
}
