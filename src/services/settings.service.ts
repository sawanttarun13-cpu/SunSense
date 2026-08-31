/**
 * ---------------------------------------------------------
 * File: settings.service.ts
 * Purpose:
 * Frontend API service for settings.service.
 * ---------------------------------------------------------
 */

import { ABOUT } from '../constants/settings';
import apiClient, { normalizeError } from '../lib/apiClient';

export interface SettingsData {
  alertThreshold: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smartAlertsEnabled: boolean;
  smartAlertPreferences: {
    highRisk: boolean;
    extremeUv: boolean;
    rapidUvIncrease: boolean;
    burnWarning: boolean;
    reapplySunscreen: boolean;
  };
}

export const settingsService = {
  getSettings: async (): Promise<SettingsData> => {
    try {
      const res = await apiClient.get('/settings');
      return res.data.data;
    } catch (err) {
      throw normalizeError(err);
    }
  },
  updateSettings: async (data: Partial<SettingsData>): Promise<SettingsData> => {
    try {
      const res = await apiClient.put('/settings', data);
      return res.data.data;
    } catch (err) {
      throw normalizeError(err);
    }
  },
  getAbout: () => Promise.resolve(ABOUT)
};
