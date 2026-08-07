"use strict";
/**
 * ---------------------------------------------------------
 * File: history.controller.ts
 * Purpose:
 * Handles all HTTP requests for history.controller.
 * ---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryController = void 0;
const history_service_1 = require("../../services/history/history.service");
const apiResponse_1 = require("../../utils/apiResponse");
const historyService = new history_service_1.HistoryService();
// Handles history.controller-related HTTP requests.
// Calls the respective service and returns API responses.
class HistoryController {
    async get(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
            const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;
            const result = await historyService.getHistory(req.userId, page, limit, startDate, endDate);
            return res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 400);
        }
    }
    async getById(req, res) {
        try {
            const result = await historyService.getSession(req.userId, req.params.id);
            return (0, apiResponse_1.sendSuccess)(res, result);
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 404);
        }
    }
}
exports.HistoryController = HistoryController;
