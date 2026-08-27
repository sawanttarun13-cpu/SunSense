/**
 * --------------------------------------------------------
 * File: requireDeviceAuth.ts
 * Layer: Middleware / Security
 *
 * Purpose:
 * Protects routes that are exclusively called by the
 * ESP8266 hardware device. The device authenticates using
 * two custom request headers instead of a JWT:
 *   x-device-id  → The UUID assigned to the device at registration.
 *   x-api-key    → The plaintext secret key generated at registration.
 *
 * Authentication Flow:
 * 1. Extract x-device-id and x-api-key from request headers.
 * 2. Look up the DeviceToken record for the given device ID.
 * 3. Compare the provided plain-text key against the bcrypt
 *    hash stored in the database.
 * 4. Reject with 401 if the device is unknown or the key is wrong.
 * 5. Update lastUsedAt timestamp on success for audit purposes.
 * 6. Attach req.deviceId and call next().
 *
 * Security Notes:
 * - The plaintext API key is NEVER stored in the database.
 *   Only the bcrypt hash is persisted.
 * - The plaintext key is returned exactly once during device
 *   registration and must be flashed onto the ESP8266 firmware.
 * - Brute-force attacks are mitigated by the global rate limiter.
 *
 * Usage:
 * router.post('/readings', requireDeviceAuth, readingsController.ingest);
 * --------------------------------------------------------
 */
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { sendError } from '../utils/apiResponse';
import { prisma } from '../config/prisma';

/**
 * Extended Express Request that carries the authenticated device's ID.
 *
 * Controllers behind `requireDeviceAuth` can safely read
 * `req.deviceId` — the middleware guarantees it is set.
 */
export interface DeviceAuthRequest extends Request {
  /** The UUID of the authenticated device. Set by requireDeviceAuth middleware. */
  deviceId?: string;
  /** The UUID of the user who owns the device. Set by requireDeviceAuth middleware. */
  userId?: string;
}

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
export const requireDeviceAuth = async (req: DeviceAuthRequest, res: Response, next: NextFunction) => {
  try {
    const deviceId = req.headers['x-device-id'] as string;
    const apiKey = req.headers['x-api-key'] as string;

    if (!deviceId || !apiKey) {
      return sendError(res, 'Unauthorized - Missing device credentials', 401);
    }

    // Fetch the stored bcrypt hash for this device, along with the device record to get the userId
    const tokenRecord = await prisma.deviceToken.findUnique({
      where: { deviceId },
      include: { device: true }
    });
    if (!tokenRecord) {
      return sendError(res, 'Unauthorized - Invalid device', 401);
    }

    // bcrypt.compare is timing-safe and handles hash comparison correctly
    const isValid = await bcrypt.compare(apiKey, tokenRecord.apiKeyHash);
    if (!isValid) {
      return sendError(res, 'Unauthorized - Invalid API key', 401);
    }

    // Record when this device last successfully authenticated.
    // Used to detect offline devices and display "Last Seen" on the dashboard.
    await prisma.deviceToken.update({
      where: { deviceId },
      data: { lastUsedAt: new Date() }
    });

    req.deviceId = deviceId;
    req.userId = tokenRecord.device.userId;
    next();
  } catch {
    return sendError(res, 'Unauthorized - Internal Error', 500);
  }
};
