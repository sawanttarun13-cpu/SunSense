"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceIngestionService = void 0;
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
const exposure_logic_service_1 = require("../exposure/exposure-logic.service");
const device_repo_1 = require("../../repositories/device/device.repo");
const realtime_service_1 = require("../events/realtime.service");
class DeviceIngestionService {
    exposureLogic = new exposure_logic_service_1.ExposureLogicService();
    deviceRepo = new device_repo_1.DeviceRepository();
    realtime = new realtime_service_1.RealtimeEventService();
    /**
     * Processes a batch of UV readings submitted by the ESP8266 device.
     *
     * Flow:
     * 1. Pass the readings array to ExposureLogicService which iterates
     *    through each reading, persists it, and updates the exposure session.
     * 2. After all readings are processed, update the device's lastPing
     *    timestamp so the dashboard can display 'Device Online' status.
     * 3. Emit dashboard:update and exposure:updated to the user's room.
     * 4. Return a summary of how many readings were inserted vs. ignored.
     *
     * @param userId   - UUID of the user who owns the device.
     * @param deviceId - UUID of the sending device (from requireDeviceAuth).
     * @param readings - Array of reading payloads from the ESP8266.
     * @param readings[].uvIndex     - UV Index measured by the S12SD sensor.
     * @param readings[].recordedAt  - ISO 8601 timestamp of when the reading was taken.
     * @returns        Object containing { inserted, duplicates, latestProcessedAt } counts.
     */
    async processPayload(userId, deviceId, readings) {
        const result = await this.exposureLogic.processReadings(userId, deviceId, readings);
        // Update the lastPing timestamp so the dashboard knows the device is online.
        // A device is considered ONLINE if lastPing is within the past 5 minutes.
        await this.deviceRepo.updateLastPing(deviceId, new Date());
        // Realtime notification emission
        try {
            if (result.inserted > 0 && result.latestProcessedAt) {
                this.realtime.emitDashboardUpdate(userId, { timestamp: result.latestProcessedAt });
                this.realtime.emitExposureUpdated(userId, { timestamp: result.latestProcessedAt });
            }
        }
        catch (err) {
            console.error(`[RealtimeEventService] Failed to emit ingestion events for user ${userId}:`, err);
        }
        return result;
    }
}
exports.DeviceIngestionService = DeviceIngestionService;
