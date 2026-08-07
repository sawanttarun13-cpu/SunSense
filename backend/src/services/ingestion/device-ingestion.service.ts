/**
 * --------------------------------------------------------
 * File: device-ingestion.service.ts
 * Layer: Service / Orchestration
 *
 * Purpose:
 * The entry point for all data arriving from the ESP8266
 * hardware device. Acts as an orchestrator that accepts a
 * batch payload of UV readings, delegates the reading-by-
 * reading business logic to ExposureLogicService, and then
 * updates the device's last-ping timestamp to signal that
 * the device is online.
 *
 * Why a Separate Ingestion Service?
 * The readings controller should not know about the
 * downstream effects of a reading (session updates, SED
 * accumulation, heartbeat tracking). By keeping this
 * orchestration in a dedicated service, we can easily add
 * new side-effects (e.g., triggering smart alerts) without
 * modifying the controller or the core exposure logic.
 *
 * Layer:
 * Orchestration / Service
 *
 * Uses:
 * ExposureLogicService  — Processes each UV reading
 * DeviceRepository      — Updates the heartbeat timestamp
 *
 * Does NOT:
 * Access Prisma directly or compute any formulas.
 * --------------------------------------------------------
 */
import { ExposureLogicService } from '../exposure/exposure-logic.service';
import { DeviceRepository } from '../../repositories/device/device.repo';

export class DeviceIngestionService {
  private exposureLogic = new ExposureLogicService();
  private deviceRepo = new DeviceRepository();

  /**
   * Processes a batch of UV readings submitted by the ESP8266 device.
   *
   * Flow:
   * 1. Pass the readings array to ExposureLogicService which iterates
   *    through each reading, persists it, and updates the exposure session.
   * 2. After all readings are processed, update the device's lastPing
   *    timestamp so the dashboard can display 'Device Online' status.
   * 3. Return a summary of how many readings were inserted vs. ignored
   *    (duplicates are silently skipped due to the unique constraint on
   *    device_id + recorded_at).
   *
   * @param userId   - UUID of the user who owns the device.
   * @param deviceId - UUID of the sending device (from requireDeviceAuth).
   * @param readings - Array of reading payloads from the ESP8266.
   * @param readings[].uvIndex     - UV Index measured by the ML8511 sensor.
   * @param readings[].recordedAt  - ISO 8601 timestamp of when the reading was taken.
   * @returns        Object containing { inserted, duplicates } counts.
   */
  async processPayload(userId: string, deviceId: string, readings: {uvIndex: number, recordedAt: string}[]) {
    const result = await this.exposureLogic.processReadings(userId, deviceId, readings);
    
    // Update the lastPing timestamp so the dashboard knows the device is online.
    // A device is considered ONLINE if lastPing is within the past 5 minutes.
    await this.deviceRepo.updateLastPing(deviceId, new Date());
    
    return result;
  }
}
