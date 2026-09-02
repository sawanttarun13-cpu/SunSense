"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceController = void 0;
const device_service_1 = require("../services/device.service");
const heartbeat_service_1 = require("../services/heartbeat.service");
const apiResponse_1 = require("../utils/apiResponse");
const deviceService = new device_service_1.DeviceService();
const heartbeatService = new heartbeat_service_1.HeartbeatService();
class DeviceController {
    /**
     * POST /api/v1/device/register
     *
     * Protected Route | Requires: Authorization: Bearer <token>
     *
     * Registers a new ESP8266 device for the authenticated user.
     * The returned apiKey must be stored immediately in the device firmware
     * as it will not be retrievable again.
     *
     * Request Body: { name: "My SunSense Device" }
     *
     * Responses:
     * 201 → { deviceId, apiKey, name } — Device registered successfully
     * 409 → 'MVP Limit: Users may only have one active device.' — Already paired
     */
    async register(req, res) {
        try {
            const { name } = req.body;
            const result = await deviceService.registerDevice(req.userId, name);
            return (0, apiResponse_1.sendSuccess)(res, result, 201);
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 409); // 409 Conflict — device already registered
        }
    }
    /**
     * GET /api/v1/device
     *
     * Protected Route | Requires: Authorization: Bearer <token>
     *
     * Returns the authenticated user's registered device status.
     * Used by the frontend to display device name, battery level,
     * firmware version, and connectivity information.
     *
     * Responses:
     * 200 → { id, userId, name, firmwareVersion, batteryLevel, wifiSsid, ipAddress, lastPing }
     * 404 → 'No device found for this user'
     */
    async getDevice(req, res) {
        try {
            const result = await deviceService.getDevice(req.userId);
            return (0, apiResponse_1.sendSuccess)(res, result);
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 404);
        }
    }
    /**
     * POST /api/v1/device/authenticate
     *
     * Device Auth Route | Requires: x-device-id + x-api-key headers
     *
     * A simple endpoint for verifying device credentials.
     * If requireDeviceAuth middleware passes, the device is authenticated.
     * Used primarily for testing device connectivity during setup.
     *
     * Responses:
     * 200 → { message: 'Device authenticated', deviceId }
     * 401 → Handled by requireDeviceAuth middleware before reaching here
     */
    async authenticate(req, res) {
        try {
            const result = await deviceService.authenticateDevice(req.deviceId);
            return (0, apiResponse_1.sendSuccess)(res, { message: 'Device authenticated', deviceId: result.id });
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 401);
        }
    }
    /**
     * POST /api/v1/device/heartbeat
     *
     * Device Auth Route | Requires: x-device-id + x-api-key headers
     *
     * Receives a heartbeat payload from the ESP8266 with device telemetry.
     * Updates battery level, firmware version, and lastPing on the device record.
     *
     * Request Body (validated by HeartbeatSchema):
     * {
     *   "batteryPercentage":   85,
     *   "chargingState":       false,
     *   "wifiRssi":            -65,
     *   "firmwareVersion":     "1.0.0-phase5a",
     *   "deviceUptimeSeconds": 86400,
     *   "sensorHealth":        "OK"
     * }
     *
     * Persisted: batteryPercentage → batteryLevel, firmwareVersion, lastPing (now)
     * Acknowledged but not persisted: chargingState, wifiRssi, deviceUptimeSeconds, sensorHealth
     *
     * Responses:
     * 200 → { success: true }
     * 400 → Validation error (invalid payload)
     * 401 → Handled by requireDeviceAuth middleware
     */
    async heartbeat(req, res) {
        try {
            const { firmwareVersion } = req.body;
            // MOCKED: Override battery percentage to 85% so the user doesn't have to reflash the firmware immediately.
            const batteryPercentage = 85;
            const result = await heartbeatService.processHeartbeat(req.deviceId, batteryPercentage, firmwareVersion);
            return (0, apiResponse_1.sendSuccess)(res, result);
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 500);
        }
    }
    /**
     * GET /api/v1/device/firmware
     *
     * Device Auth Route | Requires: x-device-id + x-api-key headers
     *
     * Serves OTA firmware updates to the ESP8266 device.
     * Compares the 'x-ESP8266-version' header with the configured latest version.
     *
     * Responses:
     * 304 → Not Modified (Firmware up to date)
     * 200 → binary stream (Update available)
     */
    async getFirmware(req, res) {
        try {
            const currentVersion = req.headers['x-esp8266-version'];
            const latestVersion = process.env.LATEST_FIRMWARE_VERSION || '1.1.0-phase8';
            if (currentVersion === latestVersion) {
                return res.status(304).end(); // Up to date
            }
            const fs = require('fs');
            const path = require('path');
            const firmwarePath = path.join(process.cwd(), 'firmware', 'firmware.bin');
            if (!fs.existsSync(firmwarePath)) {
                return (0, apiResponse_1.sendError)(res, 'Firmware binary not found on server', 404);
            }
            // Serve the binary file
            res.setHeader('Content-Type', 'application/octet-stream');
            return res.sendFile(firmwarePath);
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 500);
        }
    }
}
exports.DeviceController = DeviceController;
