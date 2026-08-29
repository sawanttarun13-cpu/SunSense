import apiClient, { normalizeError } from '../lib/apiClient';

export interface AlertData {
  id: string;
  userId: string;
  type: string;
  severity: 'info' | 'warning' | 'critical' | 'extreme' | 'resolved';
  title: string;
  message: string;
  uvValue?: number;
  batteryValue?: number;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedAlerts {
  data: AlertData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export const alertsService = {
  getAlerts: async (page = 1, limit = 20, status = 'all'): Promise<PaginatedAlerts> => {
    try {
      const { data } = await apiClient.get('/alerts', {
        params: { page, limit, status }
      });
      return data;
    } catch (err) {
      throw normalizeError(err);
    }
  },

  markRead: async (id: string): Promise<void> => {
    try {
      await apiClient.patch(`/alerts/${id}/read`);
    } catch (err) {
      throw normalizeError(err);
    }
  }
};
