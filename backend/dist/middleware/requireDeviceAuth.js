"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireDeviceAuth = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const apiResponse_1 = require("../utils/apiResponse");
const prisma_1 = require("../config/prisma");
const requireDeviceAuth = async (req, res, next) => {
    try {
        const deviceId = req.headers['x-device-id'];
        const apiKey = req.headers['x-api-key'];
        if (!deviceId || !apiKey) {
            return (0, apiResponse_1.sendError)(res, 'Unauthorized - Missing device credentials', 401);
        }
        const tokenRecord = await prisma_1.prisma.deviceToken.findUnique({ where: { deviceId } });
        if (!tokenRecord) {
            return (0, apiResponse_1.sendError)(res, 'Unauthorized - Invalid device', 401);
        }
        const isValid = await bcrypt_1.default.compare(apiKey, tokenRecord.apiKeyHash);
        if (!isValid) {
            return (0, apiResponse_1.sendError)(res, 'Unauthorized - Invalid API key', 401);
        }
        // Update last used at
        await prisma_1.prisma.deviceToken.update({
            where: { deviceId },
            data: { lastUsedAt: new Date() }
        });
        req.deviceId = deviceId;
        next();
    }
    catch (_) {
        return (0, apiResponse_1.sendError)(res, 'Unauthorized - Internal Error', 500);
    }
};
exports.requireDeviceAuth = requireDeviceAuth;
