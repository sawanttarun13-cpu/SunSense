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
  triggeredAt: string;
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
      
      // Map backend AlertType to frontend severity
      const mappedData = data.data.map((alert: any) => {
        let severity = 'info';
        switch (alert.type) {
          case 'EXTREME_UV':
            severity = 'extreme';
            break;
          case 'HIGH_RISK':
          case 'RAPID_UV_INCREASE':
            severity = 'critical';
            break;
          case 'BURN_WARNING':
          case 'DAILY_LIMIT':
          case 'BATTERY_LOW':
            severity = 'warning';
            break;
          case 'REAPPLY_SUNSCREEN':
            severity = 'info';
            break;
          case 'OFFLINE_SYNC':
            severity = 'resolved';
            break;
        }
        
        // Also map 'type' string to something readable for title if not provided
        const defaultTitles: Record<string, string> = {
          'EXTREME_UV': 'Extreme UV Level',
          'HIGH_RISK': 'High UV Risk',
          'RAPID_UV_INCREASE': 'Rapid UV Increase',
          'BURN_WARNING': 'Burn Warning',
          'DAILY_LIMIT': 'Daily Limit Reached',
          'BATTERY_LOW': 'Low Battery',
          'REAPPLY_SUNSCREEN': 'Sunscreen Reminder',
          'OFFLINE_SYNC': 'Device Synced'
        };

        return {
          ...alert,
          severity,
          title: alert.title || defaultTitles[alert.type] || 'Alert'
        };
      });

      return {
        ...data,
        data: mappedData
      };
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
  },

  deleteAlert: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/alerts/${id}`);
    } catch (err) {
      throw normalizeError(err);
    }
  }
};
