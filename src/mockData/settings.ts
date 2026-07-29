import type { NotificationSettings, AppSettings } from '../types/settings';

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
  },
  theme: 'System'
};

export const MOCK_ABOUT = {
  appVersion: 'v3.1.0',
  build: '2026.07.13',
  firmware: 'v2.3.1'
};
