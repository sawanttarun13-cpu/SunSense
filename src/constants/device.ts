/**
 * ---------------------------------------------------------
 * File: device.ts
 * Purpose:
 * Constants for device.
 * ---------------------------------------------------------
 */

// Application constants.
export const BATTERY_THRESHOLDS = {
  CRITICAL: 20,
  WARNING: 50,
  GOOD: 100
};

export const BATTERY_COLORS = {
  CRITICAL: '#EF4444', // Red
  WARNING: '#EAB308',  // Yellow
  GOOD: '#22C55E'      // Green
};

export const WIFI_LABELS = {
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Excellent'
} as const;

export const WIFI_COLORS = {
  ACTIVE: '#3B82F6',
  INACTIVE: '#E2E8F0'
};
