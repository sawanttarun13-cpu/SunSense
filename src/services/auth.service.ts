/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/services/auth.service.ts
 * Layer: Frontend / Services
 *
 * Purpose:
 * API service for authentication endpoints.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import apiClient, { normalizeError } from '../lib/apiClient';
import type { ApiResponse } from '../types/api';
import type { User } from '../types/auth';

export const authService = {
  /**
   * Registers a new user.
   */
  register: async (data: { email: string; password: string; name: string }) => {
    try {
      const res = await apiClient.post<ApiResponse<User>>('/auth/register', data);
      return res.data.data;
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Authenticates a user.
   * Note: This endpoint also sets the HttpOnly refreshToken cookie.
   */
  login: async (data: { email: string; password: string }) => {
    try {
      const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data);
      return res.data.data;
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Logs out the user.
   * Note: This endpoint clears the HttpOnly refreshToken cookie.
   */
  logout: async () => {
    try {
      const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/logout');
      return res.data.data;
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Retrieves the currently authenticated user's profile.
   */
  getMe: async () => {
    try {
      const res = await apiClient.get<ApiResponse<User>>('/auth/me');
      return res.data.data;
    } catch (err) {
      throw normalizeError(err);
    }
  },
};
