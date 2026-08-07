"use strict";
/**
 * ---------------------------------------------------------
 * File: profile.controller.ts
 * Purpose:
 * Handles all HTTP requests for profile.controller.
 * ---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const profile_service_1 = require("../../services/profile/profile.service");
const apiResponse_1 = require("../../utils/apiResponse");
const profileService = new profile_service_1.ProfileService();
// Handles profile.controller-related HTTP requests.
// Calls the respective service and returns API responses.
class ProfileController {
    async get(req, res) {
        try {
            const result = await profileService.getProfile(req.userId);
            return (0, apiResponse_1.sendSuccess)(res, result);
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 404);
        }
    }
    async update(req, res) {
        try {
            const result = await profileService.updateProfile(req.userId, req.body);
            return (0, apiResponse_1.sendSuccess)(res, result);
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 400);
        }
    }
}
exports.ProfileController = ProfileController;
