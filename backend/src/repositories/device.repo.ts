import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export class DeviceRepository {
  async create(data: Prisma.DeviceUncheckedCreateInput) {
    return prisma.device.create({ data });
  }

  async findByUserId(userId: string) {
    return prisma.device.findUnique({ where: { userId } });
  }

  async findById(id: string) {
    return prisma.device.findUnique({ where: { id } });
  }

  async saveToken(deviceId: string, apiKeyHash: string) {
    return prisma.deviceToken.upsert({
      where: { deviceId },
      update: { apiKeyHash },
      create: { deviceId, apiKeyHash }
    });
  }
}
