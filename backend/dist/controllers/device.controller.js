"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceController = void 0;
const device_service_1 = require("../services/device.service");
const apiResponse_1 = require("../utils/apiResponse");
const deviceService = new device_service_1.DeviceService();
class DeviceController {
    async register(req, res) {
        try {
            const { name } = req.body;
            const result = await deviceService.registerDevice(req.userId, name);
            return (0, apiResponse_1.sendSuccess)(res, result, 201);
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 409); // Conflict
        }
    }
    async getDevice(req, res) {
        try {
            const result = await deviceService.getDevice(req.userId);
            return (0, apiResponse_1.sendSuccess)(res, result);
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 404);
        }
    }
    async authenticate(req, res) {
        // If middleware passes, it's authenticated
        try {
            const result = await deviceService.authenticateDevice(req.deviceId);
            return (0, apiResponse_1.sendSuccess)(res, { message: 'Device authenticated', deviceId: result.id });
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 401);
        }
    }
}
exports.DeviceController = DeviceController;
