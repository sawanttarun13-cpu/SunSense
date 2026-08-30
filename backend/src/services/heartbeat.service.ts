/**
 * --------------------------------------------------------
 * File: heartbeat.service.ts
 * Layer: Service / Business Logic
 *
 * Purpose:
 * Handles the business logic for the POST /api/v1/device/heartbeat
 * endpoint. Accepts the validated heartbeat payload, delegates the
 * database update to DeviceRepository, and returns a success signal.
 *
 * Responsibility boundary:
 * This service does NOT access Prisma directly. All database writes
 * go through DeviceRepository (root repositories/device.repo.ts).
 *
 * Persisted fields (have columns in devices table):
 *   batteryLevel, firmwareVersion, lastPing
 *
 * Accepted but not persisted (no column):
 *   chargingState, wifiRssi, deviceUptimeSeconds, sensorHealth
 *   These are validated per contract and acknowledged.
 *
 * Used by:
 * DeviceController.heartbeat
 * --------------------------------------------------------
 */
import { DeviceRepository } from '../repositories/device.repo';
import { RealtimeEventService } from './events/realtime.service';

const deviceRepo = new DeviceRepository();
const realtime = new RealtimeEventService();

export class HeartbeatService {

  /**
   * Processes a heartbeat payload from the ESP8266 device.
   *
   * Updates the device record with the latest battery level, firmware
   * version, and lastPing timestamp. lastPing is set to the current
   * server time and is used by the dashboard to determine ONLINE/OFFLINE
   * status (ONLINE = lastPing within the past 5 minutes).
   *
   * @param deviceId          - UUID of the authenticated device (from requireDeviceAuth).
   * @param batteryPercentage - Battery level 0–100 reported by the firmware.
   * @param firmwareVersion   - Firmware version string reported by the device.
   * @returns                 Object with success flag confirming acknowledgement.
   */
  async processHeartbeat(
    deviceId: string,
    batteryPercentage: number,
    firmwareVersion: string,
  ): Promise<{ success: true }> {
    const now = new Date();
    const device = await deviceRepo.updateHeartbeat(deviceId, batteryPercentage, firmwareVersion, now);
    
    try {
      realtime.emitDeviceStatus(device.userId, {
        deviceId,
        isOnline: true,
        lastPing: now,
        batteryLevel: batteryPercentage,
        firmwareVersion
      });
    } catch (err) {
      console.error(`[RealtimeEventService] Failed to emit device status for device ${deviceId}:`, err);
    }
    
    return { success: true };
  }
}
