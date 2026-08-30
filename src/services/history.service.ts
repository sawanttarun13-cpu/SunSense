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
    const res = await apiClient.get('/readings/history', { params: { page, limit } });
    
    // Map backend UVReading to UVLogEntry
    const mapped: UVLogEntry[] = res.data.data.map((reading: any) => ({
      id: reading.id,
      deviceId: reading.deviceId,
      recordedAt: reading.recordedAt,
      uvIndex: Number(reading.uvIndex)
    }));

    return {
      data: mapped,
      pagination: res.data.pagination
    };
  },
};
