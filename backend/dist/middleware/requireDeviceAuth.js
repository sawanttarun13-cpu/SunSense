"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireDeviceAuth = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const apiResponse_1 = require("../utils/apiResponse");
const prisma_1 = require("../config/prisma");
/**
 * Express middleware that enforces ESP8266 device authentication.
 *
 * Rejects requests with:
 * - 401 if x-device-id or x-api-key headers are missing.
 * - 401 if no DeviceToken record exists for the given device ID.
 * - 401 if the provided API key does not match the stored bcrypt hash.
 *
 * On success:
 * - Records the current timestamp in `device_tokens.last_used_at`
 *   for audit and offline-detection purposes.
 * - Attaches `req.deviceId` for downstream use.
 *
 * @param req  - Express request (extended with optional deviceId).
 * @param res  - Express response.
 * @param next - Express next function; called only when auth passes.
 */
const requireDeviceAuth = async (req, res, next) => {
    try {
        const deviceId = req.headers['x-device-id'];
        const apiKey = req.headers['x-api-key'];
        if (!deviceId || !apiKey) {
            return (0, apiResponse_1.sendError)(res, 'Unauthorized - Missing device credentials', 401);
        }
        // Fetch the stored bcrypt hash for this device
        const tokenRecord = await prisma_1.prisma.deviceToken.findUnique({ where: { deviceId } });
        if (!tokenRecord) {
            return (0, apiResponse_1.sendError)(res, 'Unauthorized - Invalid device', 401);
        }
        // bcrypt.compare is timing-safe and handles hash comparison correctly
        const isValid = await bcrypt_1.default.compare(apiKey, tokenRecord.apiKeyHash);
        if (!isValid) {
            return (0, apiResponse_1.sendError)(res, 'Unauthorized - Invalid API key', 401);
        }
        // Record when this device last successfully authenticated.
        // Used to detect offline devices and display "Last Seen" on the dashboard.
        await prisma_1.prisma.deviceToken.update({
            where: { deviceId },
            data: { lastUsedAt: new Date() }
        });
        req.deviceId = deviceId;
        next();
    }
    catch {
        return (0, apiResponse_1.sendError)(res, 'Unauthorized - Internal Error', 500);
    }
};
exports.requireDeviceAuth = requireDeviceAuth;
