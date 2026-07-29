import { DASHBOARD_STATS, DASHBOARD_METRICS } from '../mockData/dashboard';

export const dashboardService = {
  getStats: () => Promise.resolve(DASHBOARD_STATS),
  getMetrics: () => Promise.resolve(DASHBOARD_METRICS),
};
