"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsController = void 0;
const alerts_service_1 = require("../../services/alerts/alerts.service");
const apiResponse_1 = require("../../utils/apiResponse");
const alertsService = new alerts_service_1.AlertsService();
class AlertsController {
    async get(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const status = typeof req.query.status === 'string' ? req.query.status : 'all';
            const result = await alertsService.getAlerts(req.userId, page, limit, status);
            return res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 400);
        }
    }
    async markRead(req, res) {
        try {
            const result = await alertsService.markRead(req.userId, req.params.id);
            return (0, apiResponse_1.sendSuccess)(res, result);
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 404);
        }
    }
}
exports.AlertsController = AlertsController;
