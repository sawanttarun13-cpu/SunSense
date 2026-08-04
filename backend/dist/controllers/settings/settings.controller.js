"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const settings_service_1 = require("../../services/settings/settings.service");
const apiResponse_1 = require("../../utils/apiResponse");
const settingsService = new settings_service_1.SettingsService();
class SettingsController {
    async get(req, res) {
        try {
            const result = await settingsService.getSettings(req.userId);
            return (0, apiResponse_1.sendSuccess)(res, result);
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 404);
        }
    }
    async update(req, res) {
        try {
            const result = await settingsService.updateSettings(req.userId, req.body);
            return (0, apiResponse_1.sendSuccess)(res, result);
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 400);
        }
    }
}
exports.SettingsController = SettingsController;
