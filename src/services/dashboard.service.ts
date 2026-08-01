import { DASHBOARD_STATS } from '../mockData/dashboard';

export const dashboardService = {
  getStats: () => Promise.resolve(DASHBOARD_STATS),
};
