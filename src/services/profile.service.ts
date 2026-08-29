/**
 * ---------------------------------------------------------
 * File: profile.service.ts
 * Purpose:
 * Frontend API service for profile.service.
 * ---------------------------------------------------------
 */

import { SKIN_TYPES, ACHIEVEMENTS } from '../constants/profile';
import apiClient, { normalizeError } from '../lib/apiClient';
import type { ApiResponse } from '../types/api';
import type { User } from '../types/auth';

export const profileService = {
  getProfile: async () => {
    try {
      const res = await apiClient.get<ApiResponse<User>>('/profile');
      return res.data.data;
    } catch (err) {
      throw normalizeError(err);
    }
  },
  updateProfile: async (data: Partial<User>) => {
    try {
      const res = await apiClient.put<ApiResponse<User>>('/profile', data);
      return res.data.data;
    } catch (err) {
      throw normalizeError(err);
    }
  },
  getSkinTypes: () => Promise.resolve(SKIN_TYPES),
  getAchievements: () => Promise.resolve(ACHIEVEMENTS),
};
