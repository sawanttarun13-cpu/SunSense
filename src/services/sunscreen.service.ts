import apiClient, { normalizeError } from '../lib/apiClient';

export const sunscreenService = {
  applySunscreen: async (spf: number, appliedAt?: Date): Promise<void> => {
    try {
      await apiClient.post('/sunscreen', {
        appliedSpf: spf,
        ...(appliedAt && { appliedAt: appliedAt.toISOString() })
      });
    } catch (err) {
      throw normalizeError(err);
    }
  }
};
