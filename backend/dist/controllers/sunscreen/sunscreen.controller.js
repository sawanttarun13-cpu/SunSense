"use strict";
/**
 * ---------------------------------------------------------
 * File: sunscreen.controller.ts
 * Purpose:
 * Handles all HTTP requests for sunscreen.controller.
 * ---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SunscreenController = void 0;
const sunscreen_service_1 = require("../../services/sunscreen/sunscreen.service");
const apiResponse_1 = require("../../utils/apiResponse");
const sunscreenService = new sunscreen_service_1.SunscreenService();
// Handles sunscreen.controller-related HTTP requests.
// Calls the respective service and returns API responses.
class SunscreenController {
    async apply(req, res) {
        try {
            const { appliedSpf, appliedAt } = req.body;
            const application = await sunscreenService.applySunscreen(req.userId, appliedSpf, appliedAt ? new Date(appliedAt) : new Date());
            return (0, apiResponse_1.sendSuccess)(res, application, 201);
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 400);
        }
    }
}
exports.SunscreenController = SunscreenController;
