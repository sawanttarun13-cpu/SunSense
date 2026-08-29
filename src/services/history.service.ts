/**
 * ---------------------------------------------------------
 * File: history.service.ts
 * Purpose:
 * Frontend API service for history.service.
 * ---------------------------------------------------------
 */

import apiClient from '../lib/apiClient';
import type { UVLogEntry } from '../types/history';

export const historyService = {
  getLogs: async (page = 1, limit = 14) => {
    const res = await apiClient.get('/history', { params: { page, limit } });
    
    // Map backend ExposureSession to UVLogEntry
    const mapped: UVLogEntry[] = res.data.data.map((session: any) => ({
      id: session.id,
      date: new Date(session.startTime),
      uv: Number(session.averageUvIndex)
    }));

    return {
      data: mapped,
      pagination: res.data.pagination
    };
  },
};
