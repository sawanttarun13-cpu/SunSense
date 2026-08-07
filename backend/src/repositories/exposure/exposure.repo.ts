/**
 * --------------------------------------------------------
 * File: exposure.repo.ts
 * Layer: Repository / Data Access
 *
 * Purpose:
 * The sole data access layer for the `exposure_sessions` table.
 * Provides operations for creating and updating exposure sessions
 * as part of the real-time exposure engine.
 *
 * The `exposure_sessions` table is the analytical core of
 * SunSense. Raw UV readings are aggregated into sessions here,
 * allowing the dashboard and analytics pages to query pre-computed
 * totals (SED, duration, risk) rather than recalculating from
 * thousands of raw readings on every request.
 *
 * Table Managed:
 * exposure_sessions
 *
 * Used By:
 * ExposureLogicService — Create and update sessions as readings arrive
 * DashboardRepository  — Read today's sessions for dashboard metrics
 * AnalyticsRepository  — Read all sessions for time-series grouping
 * HistoryRepository    — Read paginated sessions for history page
 *
 * Does NOT:
 * Contain any business logic. Queries only.
 * --------------------------------------------------------
 */
import { prisma } from '../../config/prisma';
import { RiskLevel } from '@prisma/client';

export class ExposureRepository {

  /**
   * Retrieves the most recently ended exposure session for a device.
   *
   * Used by the session engine to determine if there is an open/recent
   * session that the current reading should be appended to, or if a
   * new session needs to be started.
   *
   * @param deviceId - UUID of the device whose sessions to query.
   * @returns        The most recent ExposureSession, or null if none exists.
   */
  async getLastSession(deviceId: string) {
    return prisma.exposureSession.findFirst({
      where: { deviceId },
      orderBy: { endTime: 'desc' }
    });
  }

  /**
   * Creates a new exposure session starting at the given time.
   *
   * Called when the session engine determines a new session is needed:
   * either because no session exists yet, or because the gap since the
   * last reading is > 15 minutes.
   *
   * The session is initialised with durationSeconds=0 and accumulatedSed=0
   * because it has just started. These values are updated by subsequent
   * readings via `updateSession`.
   *
   * @param userId    - UUID of the user who owns the session.
   * @param deviceId  - UUID of the device recording the session.
   * @param startTime - Timestamp of the first reading that triggered this session.
   * @param uvValue   - UV Index of the triggering reading (used as initial averageUvIndex).
   * @returns         The newly created ExposureSession record.
   */
  async createSession(userId: string, deviceId: string, startTime: Date, uvValue: number) {
    return prisma.exposureSession.create({
      data: {
        userId,
        deviceId,
        startTime,
        endTime: startTime, // Initially equal to startTime; updated as the session progresses
        durationSeconds: 0,
        averageUvIndex: uvValue,
        accumulatedSed: 0,
        calculatedRisk: 'LOW' // Will be updated to the correct risk level by updateSession
      }
    });
  }

  /**
   * Updates a session's computed metrics with the latest calculations.
   *
   * Called after each new reading extends the current session. The session
   * engine re-fetches all readings in the session window, recalculates all
   * metrics, and passes the results here to persist them.
   *
   * @param sessionId      - UUID of the session to update.
   * @param endTime        - New end timestamp (the time of the latest UV reading > 0).
   * @param durationSeconds - Total duration from session start to current endTime.
   * @param averageUvIndex - Mean UV Index across all readings in the session window.
   * @param accumulatedSed - Total SED accumulated across all reading intervals in the session.
   * @param calculatedRisk - Peak risk level (based on the maximum UV reading in the session).
   * @returns              The updated ExposureSession record.
   */
  async updateSession(sessionId: string, endTime: Date, durationSeconds: number, averageUvIndex: number, accumulatedSed: number, calculatedRisk: RiskLevel) {
    return prisma.exposureSession.update({
      where: { sessionId },
      data: { endTime, durationSeconds, averageUvIndex, accumulatedSed, calculatedRisk }
    });
  }
}
