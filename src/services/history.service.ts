import { ALL_LOGS } from '../mockData/history';

export const historyService = {
  getLogs: () => Promise.resolve(ALL_LOGS),
};
