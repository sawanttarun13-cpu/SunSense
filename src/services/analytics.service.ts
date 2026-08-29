/**
 * ---------------------------------------------------------
 * File: analytics.service.ts
 * Purpose:
 * Frontend API service for analytics.service.
 * ---------------------------------------------------------
 */

import apiClient from '../lib/apiClient';

function getTzOffset() {
  return new Date().getTimezoneOffset();
}

export const analyticsService = {
  // Weekly Data (last 7 days grouped by day, though backend 'weekly' groups by week.
  // Wait, Analytics.tsx UI range 'week' shows 7 days! So we should use timeframe='daily' for the 'week' view and just take the last 7 items.)
  getWeeklyData: async () => {
    const res = await apiClient.get('/analytics', { params: { timeframe: 'daily', tzOffset: getTzOffset() } });
    const data = res.data.data.data;
    // UI expects 'day' (e.g. 'Mon', 'Tue'). We take the last 7 days from the daily data.
    // If not enough data, we pad with empty days or just show what's available.
    const last7 = data.slice(-7);
    return last7.map((item: any) => {
      const d = new Date(item.period);
      // Correct for timezone so getDay() matches local
      const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
      return {
        day: localDate.toLocaleDateString('en-US', { weekday: 'short' }),
        avg: item.averageUv,
        max: item.maxUv,
      };
    });
  },

  // Monthly Data (UI shows 6-week trend, so we use timeframe='weekly' and take last 6)
  getMonthlyData: async () => {
    const res = await apiClient.get('/analytics', { params: { timeframe: 'weekly', tzOffset: getTzOffset() } });
    const data = res.data.data.data;
    const last6 = data.slice(-6);
    return last6.map((item: any) => ({
      week: item.period, // e.g. 2026-W32
      avg: item.averageUv,
      max: item.maxUv,
    }));
  },

  // Peak Hours (timeframe='hourly')
  getPeakHoursData: async () => {
    const res = await apiClient.get('/analytics', { params: { timeframe: 'hourly', tzOffset: getTzOffset() } });
    return res.data.data.data.map((item: any) => ({
      hour: `${item.period}h`,
      uv: item.averageUv,
    }));
  },

  // Heatmap (timeframe='daily', past 91 days)
  getHeatmapData: async () => {
    const res = await apiClient.get('/analytics', { params: { timeframe: 'daily', tzOffset: getTzOffset() } });
    const dataMap = new Map();
    res.data.data.data.forEach((item: any) => {
      dataMap.set(item.period, item.maxUv);
    });

    const heatmap = [];
    const today = new Date();
    // Generate 91 days up to today
    for (let i = 90; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      heatmap.push({
        date: d,
        uv: dataMap.get(key) || 0,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    return heatmap;
  },

  // Global Trend Data (To populate the StatBoxes in Analytics.tsx, though currently they are hardcoded. We can expose this if we decide to wire them up)
  getTrendData: async () => {
    const res = await apiClient.get('/analytics', { params: { timeframe: 'weekly', tzOffset: getTzOffset() } });
    return res.data.data.trend;
  }
};
