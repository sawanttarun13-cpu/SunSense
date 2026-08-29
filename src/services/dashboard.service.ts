/**
 * ---------------------------------------------------------
 * File: dashboard.service.ts
 * Purpose:
 * Frontend API service for dashboard.service.
 * ---------------------------------------------------------
 */

import { DASHBOARD_STATS } from '../mockData/dashboard';
import apiClient, { normalizeError } from '../lib/apiClient';
import type { ApiResponse } from '../types/api';
import type { DashboardResponse } from '../types/dashboard';

// Handles API communication with the backend.
export const dashboardService = {
  // Real backend integration for Phase 6D
  getDashboard: async () => {
    try {
      const res = await apiClient.get<ApiResponse<DashboardResponse>>('/dashboard');
      return res.data.data;
    } catch (err) {
      throw normalizeError(err);
    }
  },
  
  // Kept for backward compatibility with components not yet updated
  getStats: () => Promise.resolve(DASHBOARD_STATS),
};
