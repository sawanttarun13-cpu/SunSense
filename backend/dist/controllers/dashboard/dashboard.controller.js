"use strict";
/**
 * ---------------------------------------------------------
 * File: dashboard.controller.ts
 * Purpose:
 * Handles all HTTP requests for dashboard.controller.
 * ---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("../../services/dashboard/dashboard.service");
const apiResponse_1 = require("../../utils/apiResponse");
const dashboardService = new dashboard_service_1.DashboardService();
// Handles dashboard.controller-related HTTP requests.
// Calls the respective service and returns API responses.
class DashboardController {
    async get(req, res) {
        try {
            const tzOffset = req.query.tzOffset ? parseInt(req.query.tzOffset, 10) : 0;
            const result = await dashboardService.getDashboard(req.userId, tzOffset);
            return (0, apiResponse_1.sendSuccess)(res, result);
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 400);
        }
    }
}
exports.DashboardController = DashboardController;
