import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export class ReadingsService {
  /**
   * Fetches paginated UV readings for all devices owned by the given user,
   * aggregated by 1-minute buckets per device.
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

    // Convert device UUIDs to UUID types for safe Prisma query
    const targetDeviceUuids = targetDeviceIds.map(id => Prisma.sql`${id}::uuid`);
    const deviceInClause = Prisma.join(targetDeviceUuids);
    const offset = (page - 1) * limit;

    // 1. Get total number of aggregated buckets
    const countQuery = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count
      FROM (
        SELECT device_id, to_timestamp(floor((extract('epoch' from recorded_at) / 900 )) * 900)
        FROM uv_readings
        WHERE device_id IN (${deviceInClause})
          AND recorded_at >= NOW() - INTERVAL '7 days'
        GROUP BY device_id, to_timestamp(floor((extract('epoch' from recorded_at) / 900 )) * 900)
      ) buckets;
    `;
    const total = Number(countQuery[0].count);
    const totalPages = Math.ceil(total / limit);

    // 2. Fetch paginated aggregated data
    const readings = await prisma.$queryRaw<any[]>`
      SELECT 
        device_id as "deviceId",
        to_timestamp(floor((extract('epoch' from recorded_at) / 900 )) * 900) as "recordedAt",
        AVG(uv_index) as "averageUvIndex",
        MIN(uv_index) as "minimumUvIndex",
        MAX(uv_index) as "maximumUvIndex",
        COUNT(*)::int as "sampleCount"
      FROM uv_readings
      WHERE device_id IN (${deviceInClause})
        AND recorded_at >= NOW() - INTERVAL '7 days'
      GROUP BY device_id, to_timestamp(floor((extract('epoch' from recorded_at) / 900 )) * 900)
      ORDER BY "recordedAt" DESC
      LIMIT ${limit} OFFSET ${offset};
    `;

    return {
      data: readings.map((r: any) => ({
        id: `${r.deviceId}_${new Date(r.recordedAt).getTime()}`,
        deviceId: r.deviceId,
        recordedAt: r.recordedAt,
        uvIndex: Number(r.averageUvIndex),
        minimumUvIndex: Number(r.minimumUvIndex),
        maximumUvIndex: Number(r.maximumUvIndex),
        sampleCount: Number(r.sampleCount)
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
