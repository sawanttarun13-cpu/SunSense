/**
 * ---------------------------------------------------------
 * File: history.service.ts
 * Purpose:
 * Frontend API service for history.service.
 * ---------------------------------------------------------
 */

import { ALL_LOGS } from '../mockData/history';

// Handles API communication with the backend.
export const historyService = {
  getLogs: () => Promise.resolve(ALL_LOGS),
};
