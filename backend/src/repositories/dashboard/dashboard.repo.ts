/**
 * --------------------------------------------------------
 * File: dashboard.repo.ts
 * Layer: Repository / Data Access
 *
 * Purpose:
 * Provides all database queries needed to assemble the
 * dashboard payload for the authenticated user. Groups
 * logically related queries in one place so the
 * DashboardService can fetch all required data with
 * a clear, readable interface.
 *
 * Tables Managed:
 * devices, users, exposure_sessions, uv_readings,
 * sunscreen_applications (read-only access)
 *
 * Used By:
 * DashboardService — Fetches device, user, sessions, readings, sunscreen
 *
 * Performance Notes:
 * - getTodaySessions: Uses the (user_id) index on exposure_sessions
 *   plus a startTime filter. Bounded to one calendar day.
 * - getTodayReadings: Uses the (device_id) index on uv_readings.
 *   Ordered desc so the most recent reading is first in the result array.
 * --------------------------------------------------------
 */
import { prisma } from '../../config/prisma';

export class DashboardRepository {

  /**
   * Retrieves the device registered for the given user.
   *
   * Returns null if the user has not yet paired an ESP8266 device,
   * which causes the DashboardService to return a 'deviceConnected: false' payload.
   *
   * @param userId - UUID of the authenticated user.
   * @returns      The user's Device record, or null if unpaired.
   */
  async getDevice(userId: string) {
    return prisma.device.findUnique({ where: { userId } });
  }

  /**
   * DEV MODE ONLY: Returns the first device in the system regardless of owner.
   *
   * This supports single-device testing where a newly registered user
   * should still see dashboard data from the shared physical device.
   *
   * TODO: Remove before production deployment.
   *
   * @returns The first Device record, or null if no devices exist.
   */
  async getAnyDevice() {
    return prisma.device.findFirst();
  }

  /**
   * Retrieves the user record.
   *
   * Used to read skinType and preferredSpf, which are passed to
   * CalculationService.recommendSpf() to personalise the dashboard's
   * SPF recommendation to the user's skin profile.
   *
   * @param userId - UUID of the user to fetch.
   * @returns      The User record, or null if not found.
   */
  async getUser(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  /**
   * Returns all exposure sessions for a device that started today.
   *
   * "Today" is defined by the caller (DashboardService) as the start
   * of the current UTC day. These sessions are used to compute:
   * - Total exposure time (sum of durationSeconds)
   * - Total UV dose (sum of accumulatedSed)
   *
   * @param deviceId   - UUID of the device to query sessions for.
   * @param startOfDay - UTC midnight of the current day.
   * @returns          Array of ExposureSessions that started after startOfDay.
   */
  async getTodaySessions(deviceId: string, startOfDay: Date) {
    return prisma.exposureSession.findMany({
      where: { deviceId, startTime: { gte: startOfDay } }
    });
  }

  /**
   * Returns all UV readings for a device recorded today.
   *
   * Ordered descending so that `readings[0]` is the most recent
   * reading — used directly as the "current UV" value on the dashboard.
   * All readings are also used to compute today's peak and average UV.
   *
   * @param deviceId   - UUID of the device to query.
   * @param startOfDay - UTC midnight of the current day.
   * @returns          Array of UVReadings recorded since startOfDay, most recent first.
   */
  async getTodayReadings(deviceId: string, startOfDay: Date) {
    return prisma.uVReading.findMany({
      where: { deviceId, recordedAt: { gte: startOfDay } },
      orderBy: { recordedAt: 'desc' }
    });
  }

  /**
   * Returns the most recently applied sunscreen for the user.
   *
   * Used by the DashboardService to determine if the user has active
   * sunscreen protection and how many minutes remain before expiry.
   *
   * @param userId - UUID of the user to look up.
   * @returns      The most recent SunscreenApplication, or null if never applied.
   */
  async getLatestSunscreen(userId: string) {
    return prisma.sunscreenApplication.findFirst({
      where: { userId },
      orderBy: { appliedAt: 'desc' }
    });
  }
}
