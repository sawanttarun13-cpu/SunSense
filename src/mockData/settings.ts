/**
 * ---------------------------------------------------------
 * File: settings.ts
 * Purpose:
 * Frontend file for settings.
 * ---------------------------------------------------------
 */

import type { NotificationSettings, AppSettings } from '../types/settings';

// Frontend logic for settings.
export const MOCK_SETTINGS: AppSettings = {
  spfLevel: 30,
  uvThreshold: 6,
  notifications: {
    extreme: true,
    high: true,
    spfReminder: true,
    dailySummary: true,
    batteryLow: true,
    disconnect: false,
    sound: true
  }
};

export const MOCK_ABOUT = {
  appVersion: 'v3.1.0',
  build: '2026.07.13',
  firmware: 'v2.3.1'
};
