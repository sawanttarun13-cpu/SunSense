"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceRepository = void 0;
/**
 * --------------------------------------------------------
 * File: device.repo.ts (repositories/device/)
 * Layer: Repository / Data Access
 *
 * Purpose:
 * Handles real-time device state updates for the `devices`
 * table. Specifically updates the `last_ping` timestamp
 * after the ingestion service successfully processes a
 * reading batch. This timestamp is used by the dashboard
 * to determine if the device is currently ONLINE or OFFLINE.
 *
 * Separation Rationale:
 * This repository lives in a separate folder from the root-
 * level device.repo.ts because it serves a different concern:
 * real-time ingestion state vs. registration/auth.
 *
 * Table Managed:
 * devices (last_ping column only)
 *
 * Used By:
 * DeviceIngestionService — Updates heartbeat after reading batch
 *
 * Does NOT:
 * Contain any business logic. Single-column update only.
 * --------------------------------------------------------
 */
const prisma_1 = require("../../config/prisma");
class DeviceRepository {
    /**
     * Updates the `last_ping` timestamp for a device.
     *
     * Called by DeviceIngestionService after each successful batch
     * of UV readings is processed. The dashboard uses this timestamp
     * to display device online/offline status:
     *
     *   ONLINE  if (now - lastPing) < 5 minutes
     *   OFFLINE if (now - lastPing) ≥ 5 minutes
     *
     * @param deviceId - UUID of the device to update.
     * @param date     - The current server time to record as the last ping.
     * @returns        The updated Device record.
     */
    async updateLastPing(deviceId, date) {
        return prisma_1.prisma.device.update({
            where: { id: deviceId },
            data: { lastPing: date }
        });
    }
}
exports.DeviceRepository = DeviceRepository;
