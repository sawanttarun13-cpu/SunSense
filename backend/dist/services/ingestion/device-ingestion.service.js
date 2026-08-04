"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceIngestionService = void 0;
const exposure_logic_service_1 = require("../exposure/exposure-logic.service");
const device_repo_1 = require("../../repositories/device/device.repo");
class DeviceIngestionService {
    exposureLogic = new exposure_logic_service_1.ExposureLogicService();
    deviceRepo = new device_repo_1.DeviceRepository();
    async processPayload(userId, deviceId, readings) {
        const result = await this.exposureLogic.processReadings(userId, deviceId, readings);
        // Update heartbeat
        await this.deviceRepo.updateLastPing(deviceId, new Date());
        return result;
    }
}
exports.DeviceIngestionService = DeviceIngestionService;
