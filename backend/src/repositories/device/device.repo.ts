import { prisma } from '../../config/prisma';

export class DeviceRepository {
  async updateLastPing(deviceId: string, date: Date) {
    return prisma.device.update({
      where: { id: deviceId },
      data: { lastPing: date }
    });
  }
}
