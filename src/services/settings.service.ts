/**
 * ---------------------------------------------------------
 * File: settings.service.ts
 * Purpose:
 * Frontend API service for settings.service.
 * ---------------------------------------------------------
 */

import { MOCK_SETTINGS, MOCK_ABOUT } from '../mockData/settings';

// Handles API communication with the backend.
export const settingsService = {
  getSettings: () => Promise.resolve(MOCK_SETTINGS),
  getAbout: () => Promise.resolve(MOCK_ABOUT)
};
