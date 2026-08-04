import { ExposureLogicService } from '../exposure/exposure-logic.service';
import { DeviceRepository } from '../../repositories/device/device.repo';

export class DeviceIngestionService {
  private exposureLogic = new ExposureLogicService();
  private deviceRepo = new DeviceRepository();

  async processPayload(userId: string, deviceId: string, readings: {uvIndex: number, recordedAt: string}[]) {
    const result = await this.exposureLogic.processReadings(userId, deviceId, readings);
    
    // Update heartbeat
    await this.deviceRepo.updateLastPing(deviceId, new Date());
    
    return result;
  }
}
