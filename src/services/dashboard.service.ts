/**
 * ---------------------------------------------------------
 * File: dashboard.service.ts
 * Purpose:
 * Frontend API service for dashboard.service.
 * ---------------------------------------------------------
 */

import { DASHBOARD_STATS } from '../mockData/dashboard';

// Handles API communication with the backend.
export const dashboardService = {
  getStats: () => Promise.resolve(DASHBOARD_STATS),
};
