import { weeklyData, monthlyData, peakHoursData, heatmapData } from '../mockData/analytics';

export const analyticsService = {
  getWeeklyData: () => Promise.resolve(weeklyData),
  getMonthlyData: () => Promise.resolve(monthlyData),
  getPeakHoursData: () => Promise.resolve(peakHoursData),
  getHeatmapData: () => Promise.resolve(heatmapData),
};
