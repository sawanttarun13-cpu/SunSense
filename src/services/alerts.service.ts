import { ALERT_DATA } from '../mockData/alerts';

export const alertsService = {
  getAlerts: () => Promise.resolve(ALERT_DATA),
};
