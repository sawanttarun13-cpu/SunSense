/**
 * ---------------------------------------------------------
 * File: profile.service.ts
 * Purpose:
 * Frontend API service for profile.service.
 * ---------------------------------------------------------
 */

import { MOCK_USER_PROFILE, SKIN_TYPES, SENSITIVITY_LEVELS, ACHIEVEMENTS } from '../mockData/profile';
import apiClient, { normalizeError } from '../lib/apiClient';
import type { ApiResponse } from '../types/api';
import type { User } from '../types/auth';

// Handles API communication with the backend.
export const profileService = {
  getProfile: () => Promise.resolve(MOCK_USER_PROFILE),
  updateProfile: async (data: Partial<typeof MOCK_USER_PROFILE>) => {
    try {
      const res = await apiClient.put<ApiResponse<User>>('/profile', data);
      // We still update the mock profile locally so other mock components reflect it
      Object.assign(MOCK_USER_PROFILE, data);
      return res.data.data;
    } catch (err) {
      throw normalizeError(err);
    }
  },
  getSkinTypes: () => Promise.resolve(SKIN_TYPES),
  getSensitivityLevels: () => Promise.resolve(SENSITIVITY_LEVELS),
  getAchievements: () => Promise.resolve(ACHIEVEMENTS),
};
