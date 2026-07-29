import { MOCK_SETTINGS, MOCK_ABOUT } from '../mockData/settings';

export const settingsService = {
  getSettings: () => Promise.resolve(MOCK_SETTINGS),
  getAbout: () => Promise.resolve(MOCK_ABOUT)
};
