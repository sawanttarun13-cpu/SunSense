import { prisma } from '../../config/prisma';

export class ReadingsService {
  /**
   * Fetches paginated raw UV readings for all devices owned by the given user.
   * Multi-device constraint: SunSense supports multiple devices per user.
   * Readings belong to devices, not users directly. We find all devices for the user
   * and fetch readings belonging to any of those devices.
   */
  async getHistory(userId: string, page: number, limit: number, deviceIdFilter?: string) {
    const devices = await prisma.device.findMany({
      where: { userId },
      select: { id: true }
    });

    if (devices.length === 0) {
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      };
    }

    const deviceIds = devices.map((d: any) => d.id);
    
    // Validate optional deviceIdFilter against owned devices
    let targetDeviceIds = deviceIds;
    if (deviceIdFilter) {
      if (!deviceIds.includes(deviceIdFilter)) {
        throw new Error('Device not found or not owned by user');
      }
      targetDeviceIds = [deviceIdFilter];
    }

    const where = {
      deviceId: { in: targetDeviceIds }
    };

    const total = await prisma.uVReading.count({ where });
    const totalPages = Math.ceil(total / limit);

    const readings = await prisma.uVReading.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data: readings.map((r: any) => ({
        id: r.id,
        deviceId: r.deviceId,
        recordedAt: r.recordedAt,
        uvIndex: Number(r.uvIndex)
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }
}
