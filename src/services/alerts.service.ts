/**
 * ---------------------------------------------------------
 * File: alerts.service.ts
 * Purpose:
 * Frontend API service for alerts.service.
 * ---------------------------------------------------------
 */

import { ALERT_DATA } from '../mockData/alerts';

// Handles API communication with the backend.
export const alertsService = {
  getAlerts: () => Promise.resolve(ALERT_DATA),
};
