import { prisma } from '../../config/prisma';
import { RiskLevel } from '@prisma/client';

export class ExposureRepository {
  async getLastSession(deviceId: string) {
    return prisma.exposureSession.findFirst({
      where: { deviceId },
      orderBy: { endTime: 'desc' }
    });
  }

  async createSession(userId: string, deviceId: string, startTime: Date, uvValue: number) {
    return prisma.exposureSession.create({
      data: {
        userId, deviceId, startTime, endTime: startTime,
        durationSeconds: 0, averageUvIndex: uvValue, accumulatedSed: 0, calculatedRisk: 'LOW'
      }
    });
  }

  async updateSession(sessionId: string, endTime: Date, durationSeconds: number, averageUvIndex: number, accumulatedSed: number, calculatedRisk: RiskLevel) {
    return prisma.exposureSession.update({
      where: { sessionId },
      data: { endTime, durationSeconds, averageUvIndex, accumulatedSed, calculatedRisk }
    });
  }
}
