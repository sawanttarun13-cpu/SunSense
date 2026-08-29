/**
 * ---------------------------------------------------------
 * File: device.service.ts
 * Purpose:
 * Frontend API service for device.service.
 * ---------------------------------------------------------
 */

import apiClient, { normalizeError } from '../lib/apiClient';

export interface DeviceData {
  id: string;
  name: string;
  firmwareVersion: string | null;
  batteryLevel: number | null;
  wifiSsid: string | null;
  ipAddress: string | null;
  lastPing: string | null;
}

export const deviceService = {
  getDeviceData: async (): Promise<DeviceData | null> => {
    try {
      const res = await apiClient.get('/device');
      return res.data.data;
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },
  syncDevice: () => new Promise<void>((resolve) => setTimeout(resolve, 2200))
};
