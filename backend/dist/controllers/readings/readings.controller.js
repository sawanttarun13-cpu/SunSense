"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadingsController = void 0;
const device_ingestion_service_1 = require("../../services/ingestion/device-ingestion.service");
const apiResponse_1 = require("../../utils/apiResponse");
const readings_service_1 = require("../../services/readings/readings.service");
const ingestionService = new device_ingestion_service_1.DeviceIngestionService();
const readingsService = new readings_service_1.ReadingsService();
class ReadingsController {
    /**
     * GET /api/v1/readings/history
     * Protected (User JWT)
     * Fetches paginated raw UV readings for devices owned by the user.
     */
    async getHistory(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const deviceId = req.query.deviceId;
            const boundedLimit = Math.max(1, Math.min(limit, 100)); // Cap limit between 1-100
            const result = await readingsService.getHistory(req.userId, page, boundedLimit, deviceId);
            return res.status(200).json(result);
        }
        catch (error) {
            if (error.message.includes('not found')) {
                return (0, apiResponse_1.sendError)(res, error.message, 404);
            }
            return (0, apiResponse_1.sendError)(res, error.message, 400);
        }
    }
    /**
     * POST /api/v1/readings
     *
     * Protected (User JWT + Device API Key)
     *
     * Ingests a batch of UV readings from the ESP8266.
     * The device ID is extracted from the x-device-id header
     * (already validated by requireDeviceAuth middleware).
     *
     * Request Body:
     * {
     *   "readings": [
     *     { "uvIndex": 7.4, "recordedAt": "2026-08-07T10:30:00Z" },
     *     { "uvIndex": 8.1, "recordedAt": "2026-08-07T10:31:00Z" }
     *   ]
     * }
     *
     * Responses:
     * 200 → { success: true, status: 'success', inserted: N, duplicates: M }
     * 400 → Missing x-device-id header or processing error
     */
    async process(req, res) {
        try {
            const deviceId = req.headers['x-device-id'];
            if (!deviceId)
                return (0, apiResponse_1.sendError)(res, 'x-device-id header is required', 400);
            const result = await ingestionService.processPayload(req.userId, deviceId, req.body.readings);
            return res.status(200).json({ success: true, status: 'success', ...result });
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 400);
        }
    }
}
exports.ReadingsController = ReadingsController;
