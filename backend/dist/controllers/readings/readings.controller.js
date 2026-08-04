"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadingsController = void 0;
const device_ingestion_service_1 = require("../../services/ingestion/device-ingestion.service");
const apiResponse_1 = require("../../utils/apiResponse");
const ingestionService = new device_ingestion_service_1.DeviceIngestionService();
class ReadingsController {
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
