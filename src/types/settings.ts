/**
 * ---------------------------------------------------------
 * File: settings.ts
 * Purpose:
 * TypeScript type definitions for settings.
 * ---------------------------------------------------------
 */

export interface NotificationSettings {
  extreme: boolean;
  high: boolean;
  spfReminder: boolean;
  dailySummary: boolean;
  batteryLow: boolean;
  disconnect: boolean;
  sound: boolean;
}

export interface AppSettings {
  spfLevel: number;
  uvThreshold: number;
  notifications: NotificationSettings;
}
