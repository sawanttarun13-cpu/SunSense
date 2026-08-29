/**
 * ---------------------------------------------------------
 * File: dashboard.service.ts
 * Purpose:
 * Frontend API service for dashboard.service.
 * ---------------------------------------------------------
 */

import apiClient, { normalizeError } from '../lib/apiClient';
import type { ApiResponse } from '../types/api';
import type { DashboardResponse } from '../types/dashboard';

// Handles API communication with the backend.
export const dashboardService = {
  // Real backend integration for Phase 6D
  getDashboard: async (tzOffset?: number) => {
    try {
      const url = tzOffset !== undefined ? `/dashboard?tzOffset=${tzOffset}` : '/dashboard';
      const res = await apiClient.get<ApiResponse<DashboardResponse>>(url);
      return res.data.data;
    } catch (err) {
      throw normalizeError(err);
    }
  }
};
