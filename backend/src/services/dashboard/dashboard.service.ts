import { DashboardRepository } from '../../repositories/dashboard/dashboard.repo';
import { CalculationService } from '../calculation/calculation.service';
import { SunscreenService } from '../sunscreen/sunscreen.service';

const dashboardRepo = new DashboardRepository();
const calcService = new CalculationService();
const sunscreenService = new SunscreenService();

export class DashboardService {
  async getDashboard(userId: string) {
    const device = await dashboardRepo.getDevice(userId);
    const user = await dashboardRepo.getUser(userId);
    
    if (!device) {
      return { deviceConnected: false, error: 'No device found' };
    }

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const sessions = await dashboardRepo.getTodaySessions(device.id, startOfDay);
    const readings = await dashboardRepo.getTodayReadings(device.id, startOfDay);
    const sunscreen = await dashboardRepo.getLatestSunscreen(userId);

    const todayExposure = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
    const todayDose = sessions.reduce((sum, s) => sum + Number(s.accumulatedSed), 0);

    let peakUv = 0;
    let sumUv = 0;
    for (const r of readings) {
      const val = Number(r.uvIndex);
      if (val > peakUv) peakUv = val;
      sumUv += val;
    }
    const averageUv = readings.length > 0 ? sumUv / readings.length : 0;
    const currentUv = readings.length > 0 ? Number(readings[0].uvIndex) : 0;

    const currentRisk = calcService.calculateRisk(currentUv);
    const skinType = user?.skinType || 3;
    const currentSpfRecommendation = calcService.recommendSpf(currentUv, skinType);

    const lastPing = device.lastPing;
    const isOnline = lastPing ? (new Date().getTime() - lastPing.getTime()) < 300000 : false; // 5 mins

    let activeProtection = false;
    let protectionRemaining = 0;
    if (sunscreen) {
      const remaining = sunscreenService.calculateRemainingMinutes(sunscreen.expiresAt);
      if (remaining > 0) {
        activeProtection = true;
        protectionRemaining = remaining;
      }
    }

    return {
      deviceConnected: true,
      deviceStatus: isOnline ? 'ONLINE' : 'OFFLINE',
      batteryStatus: device.batteryLevel || null,
      lastSync: lastPing,
      todayExposure,
      todayDose,
      peakUv,
      averageUv,
      currentUv,
      currentRisk,
      currentSpfRecommendation,
      activeProtection,
      protectionRemaining
    };
  }
}
