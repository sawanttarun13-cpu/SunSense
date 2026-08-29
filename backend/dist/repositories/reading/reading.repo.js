"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadingRepository = void 0;
/**
 * --------------------------------------------------------
 * File: reading.repo.ts
 * Layer: Repository / Data Access
 *
 * Purpose:
 * The sole data access layer for the `uv_readings` table.
 * Provides operations for inserting new readings and
 * querying reading windows needed by the exposure session
 * engine.
 *
 * Table Managed:
 * uv_readings
 *
 * Used By:
 * ExposureLogicService — Insert readings; query for session boundary detection
 *
 * Performance Notes:
 * - `getLastReadingBefore`: Uses the composite index on (device_id) and
 *   the index on (recorded_at) to efficiently find the previous reading.
 * - `getSessionReadings`: Uses the (device_id) index to filter, then
 *   (recorded_at) range to bound the window.
 * - All queries are scoped to a specific device_id to ensure fast index scans.
 * --------------------------------------------------------
 */
const prisma_1 = require("../../config/prisma");
class ReadingRepository {
    /**
     * Inserts a single UV reading into the database.
     *
     * The `uv_readings` table has a UNIQUE constraint on
     * (device_id, recorded_at). If a duplicate reading is submitted
     * (e.g., the device sends the same batch twice during reconnection),
     * Prisma will throw a P2002 unique constraint violation.
     * The ExposureLogicService catches this and skips the duplicate silently.
     *
     * @param deviceId   - UUID of the device that recorded the reading.
     * @param uvIndex    - UV Index value (clamped to ≥ 0 before calling this).
     * @param recordedAt - Exact timestamp when the S12SD sensor took the reading.
     * @returns          The newly created UVReading record.
     * @throws           Prisma P2002 if (deviceId, recordedAt) already exists.
     */
    async createReading(deviceId, uvIndex, recordedAt) {
        return prisma_1.prisma.uVReading.create({ data: { deviceId, uvIndex, recordedAt } });
    }
    /**
     * Finds the most recent reading recorded BEFORE a given timestamp.
     *
     * Used by the exposure session engine to calculate the time gap
     * between consecutive readings, which determines whether to start
     * a new session or extend the existing one.
     *
     * @param deviceId   - UUID of the device to query.
     * @param recordedAt - The current reading's timestamp. The query returns
     *                     the reading immediately before this timestamp.
     * @returns          The previous UVReading, or null if this is the first reading.
     */
    async getLastReadingBefore(deviceId, recordedAt) {
        return prisma_1.prisma.uVReading.findFirst({
            where: { deviceId, recordedAt: { lt: recordedAt } },
            orderBy: { recordedAt: 'desc' }
        });
    }
    /**
     * Finds the most recent reading with a UV Index > 0, recorded at or before
     * the given timestamp.
     *
     * Used to distinguish between "device indoors" (UV=0 gap) and "device offline"
     * (full time gap). A non-zero reading means the user was actively in the sun;
     * a run of zero readings just means they stepped inside temporarily.
     *
     * @param deviceId   - UUID of the device to query.
     * @param recordedAt - Upper bound timestamp (inclusive).
     * @returns          The last non-zero UVReading, or null if none exists.
     */
    async getLastNonZeroReadingBefore(deviceId, recordedAt) {
        return prisma_1.prisma.uVReading.findFirst({
            where: { deviceId, uvIndex: { gt: 0 }, recordedAt: { lte: recordedAt } },
            orderBy: { recordedAt: 'desc' }
        });
    }
    /**
     * Returns all UV readings for a device within a given time window.
     *
     * Used by the exposure session engine to recalculate SED,
     * average UV, and peak UV after each new reading extends the session.
     * Results are ordered ascending so SED is accumulated in chronological order.
     *
     * @param deviceId  - UUID of the device to query.
     * @param startTime - Session start timestamp (inclusive lower bound).
     * @param endTime   - Session end timestamp (inclusive upper bound).
     * @returns         Array of UVReadings in the session window, sorted chronologically.
     */
    async getSessionReadings(deviceId, startTime, endTime) {
        return prisma_1.prisma.uVReading.findMany({
            where: { deviceId, recordedAt: { gte: startTime, lte: endTime } },
            orderBy: { recordedAt: 'asc' }
        });
    }
}
exports.ReadingRepository = ReadingRepository;
