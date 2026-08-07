/**
 * ---------------------------------------------------------
 * File: analytics.service.ts
 * Purpose:
 * Frontend API service for analytics.service.
 * ---------------------------------------------------------
 */

import { weeklyData, monthlyData, peakHoursData, heatmapData } from '../mockData/analytics';

// Handles API communication with the backend.
export const analyticsService = {
  getWeeklyData: () => Promise.resolve(weeklyData),
  getMonthlyData: () => Promise.resolve(monthlyData),
  getPeakHoursData: () => Promise.resolve(peakHoursData),
  getHeatmapData: () => Promise.resolve(heatmapData),
};
