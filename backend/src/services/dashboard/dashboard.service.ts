import { DashboardRepository } from '../../repositories/dashboard/dashboard.repo';
const dashboardRepo = new DashboardRepository();

export class DashboardService {
  async getDashboard(userId: string) {
    const data = await dashboardRepo.getOverview(userId);
    return {
      deviceConnected: !!data.device,
      lastSync: data.device?.lastPing || null,
      todayExposure: 0,
      currentRisk: 'LOW',
    };
  }
}
