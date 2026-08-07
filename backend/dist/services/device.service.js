"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceService = void 0;
/**
 * --------------------------------------------------------
 * File: device.service.ts
 * Layer: Service / Business Logic
 *
 * Purpose:
 * Handles all device-related business logic including
 * ESP8266 registration (with MVP one-device-per-user
 * enforcement), API key generation, and device retrieval.
 *
 * Layer:
 * Business Logic
 *
 * Uses:
 * DeviceRepository (repositories/device.repo.ts)
 *
 * Does NOT:
 * Access Prisma directly. All database writes/reads go
 * through the DeviceRepository.
 *
 * Security:
 * The plaintext API key is generated here using a
 * cryptographically secure random bytes generator (Node's
 * crypto module). It is hashed with bcrypt before storage.
 * The plaintext key is returned ONLY ONCE at registration
 * and must be immediately stored in the device firmware.
 * --------------------------------------------------------
 */
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const device_repo_1 = require("../repositories/device.repo");
const deviceRepo = new device_repo_1.DeviceRepository();
class DeviceService {
    /**
     * Registers a new ESP8266 device for the authenticated user.
     *
     * Steps:
     * 1. Enforce the MVP hard limit: one active device per user.
     *    Throws if the user already has a registered device.
     * 2. Create the device record in the database.
     * 3. Generate a 32-byte cryptographically random API key.
     * 4. Hash the key with bcrypt (10 rounds) and persist the hash.
     * 5. Return the device ID and PLAINTEXT key to the caller.
     *
     * IMPORTANT:
     * The plaintext `apiKey` in the return value must be immediately
     * flashed into the ESP8266 firmware. It cannot be retrieved again —
     * only the bcrypt hash is stored.
     *
     * @param userId - UUID of the authenticated user registering the device.
     * @param name   - Human-readable name for the device (e.g., "Backpack Sensor").
     * @returns      Object containing { deviceId, apiKey (plaintext), name }.
     * @throws       'MVP Limit: Users may only have one active device.' if already registered.
     */
    async registerDevice(userId, name) {
        // MVP Rule: One user → one device. Reject if a device already exists.
        const existingDevice = await deviceRepo.findByUserId(userId);
        if (existingDevice) {
            throw new Error('MVP Limit: Users may only have one active device.');
        }
        const device = await deviceRepo.create({
            userId,
            name,
        });
        // Generate a 64-character hex API key using a CSPRNG.
        // This is the plaintext secret the ESP8266 will send in x-api-key header.
        const plainApiKey = crypto_1.default.randomBytes(32).toString('hex');
        const apiKeyHash = await bcrypt_1.default.hash(plainApiKey, 10);
        // Persist the bcrypt hash. The plaintext key is NEVER stored.
        await deviceRepo.saveToken(device.id, apiKeyHash);
        return {
            deviceId: device.id,
            apiKey: plainApiKey, // Returned only once — store this immediately in firmware
            name: device.name
        };
    }
    /**
     * Retrieves a device record by its ID.
     *
     * Used internally by other services that need device details
     * after the device has been authenticated via requireDeviceAuth.
     *
     * @param deviceId - UUID of the device to look up.
     * @returns        The device record.
     * @throws         'Device not found' if no matching record exists.
     */
    async authenticateDevice(deviceId) {
        const device = await deviceRepo.findById(deviceId);
        if (!device)
            throw new Error('Device not found');
        return device;
    }
    /**
     * Retrieves the device registered to the given user.
     *
     * Called by the dashboard, device status page, and any endpoint
     * that needs to resolve userId → device.
     *
     * @param userId - UUID of the authenticated user.
     * @returns      The user's registered device record.
     * @throws       'No device found for this user' if the user has not yet registered a device.
     */
    async getDevice(userId) {
        const device = await deviceRepo.findByUserId(userId);
        if (!device)
            throw new Error('No device found for this user');
        return device;
    }
}
exports.DeviceService = DeviceService;
