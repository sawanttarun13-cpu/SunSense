import { MOCK_DEVICE } from '../mockData/device';

export const deviceService = {
  getDeviceData: () => Promise.resolve(MOCK_DEVICE),
  syncDevice: () => new Promise<void>((resolve) => setTimeout(resolve, 2200)) // Keep the manual sync delay as a realistic simulation of bluetooth/wifi sync
};
