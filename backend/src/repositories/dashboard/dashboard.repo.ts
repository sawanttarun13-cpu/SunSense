import { prisma } from '../../config/prisma';

export class DashboardRepository {
  async getOverview(userId: string) {
    const device = await prisma.device.findUnique({ where: { userId } });
    return { device };
  }
}
