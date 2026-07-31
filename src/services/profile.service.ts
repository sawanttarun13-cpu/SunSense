import { MOCK_USER_PROFILE, SKIN_TYPES, SENSITIVITY_LEVELS, ACHIEVEMENTS } from '../mockData/profile';

export const profileService = {
  getProfile: () => Promise.resolve(MOCK_USER_PROFILE),
  updateProfile: (data: Partial<typeof MOCK_USER_PROFILE>) => {
    Object.assign(MOCK_USER_PROFILE, data);
    return Promise.resolve(MOCK_USER_PROFILE);
  },
  getSkinTypes: () => Promise.resolve(SKIN_TYPES),
  getSensitivityLevels: () => Promise.resolve(SENSITIVITY_LEVELS),
  getAchievements: () => Promise.resolve(ACHIEVEMENTS),
};
