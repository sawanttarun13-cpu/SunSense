"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const device_repo_1 = require("../repositories/device.repo");
const deviceRepo = new device_repo_1.DeviceRepository();
class DeviceService {
    async registerDevice(userId, name) {
        // Enforce MVP Hard Limit: 1 Device per User
        const existingDevice = await deviceRepo.findByUserId(userId);
        if (existingDevice) {
            throw new Error('MVP Limit: Users may only have one active device.');
        }
        // Create Device
        const device = await deviceRepo.create({
            userId,
            name,
        });
        // Generate Secure API Key
        const plainApiKey = crypto_1.default.randomBytes(32).toString('hex');
        const apiKeyHash = await bcrypt_1.default.hash(plainApiKey, 10);
        await deviceRepo.saveToken(device.id, apiKeyHash);
        return {
            deviceId: device.id,
            apiKey: plainApiKey, // Return only once
            name: device.name
        };
    }
    async authenticateDevice(deviceId) {
        const device = await deviceRepo.findById(deviceId);
        if (!device)
            throw new Error('Device not found');
        return device;
    }
    async getDevice(userId) {
        const device = await deviceRepo.findByUserId(userId);
        if (!device)
            throw new Error('No device found for this user');
        return device;
    }
}
exports.DeviceService = DeviceService;
