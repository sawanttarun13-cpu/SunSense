/**
 * --------------------------------------------------------
 * File: exposure-logic.service.ts
 * Layer: Service / Core Business Logic
 *
 * Purpose:
 * Implements the Exposure Session Engine — the most complex
 * business logic in the SunSense backend. Processes UV
 * readings one by one, decides whether each reading belongs
 * to an ongoing session or starts a new one, and calculates
 * the real-time accumulated SED and risk level for the
 * current session.
 *
 * Session Rules (from the approved architecture):
 * - A new session is created when:
 *   a) No prior session exists and the first UV reading > 0.
 *   b) The gap between the last UV reading and the new reading
 *      is > 15 minutes (the user stepped inside).
 *   c) The day boundary has changed (new calendar day UTC).
 *
 * - A session is extended (updated) when:
 *   The new reading arrives within 15 minutes of the last
 *   non-zero reading in the current session.
 *
 * - Duplicate readings are silently skipped.
 *   The UNIQUE constraint on (device_id, recorded_at)
 *   in the database will throw, and the catch block
 *   continues to the next reading without interrupting
 *   the batch.
 *
 * Layer:
 * Business Logic (Core Engine)
 *
 * Uses:
 * ReadingRepository   — Persists raw UV readings
 * ExposureRepository  — Creates/updates Exposure Sessions
 * CalculationService  — SED increments, Risk Level classification
 *
 * Does NOT:
 * Access Prisma directly. All DB operations go through repositories.
 * --------------------------------------------------------
 */
import { ReadingRepository } from '../../repositories/reading/reading.repo';
import { ExposureRepository } from '../../repositories/exposure/exposure.repo';
import { CalculationService } from '../calculation/calculation.service';

export class ExposureLogicService {
  private readingRepo = new ReadingRepository();
  private exposureRepo = new ExposureRepository();
  private calcService = new CalculationService();

  /**
   * Processes an ordered batch of UV readings from a device and updates
   * the exposure session state in the database.
   *
   * Algorithm (per reading):
   * 1. Sort readings chronologically to ensure correct SED accumulation.
   * 2. Clamp UV value to 0 (negative values from sensor noise are treated as 0).
   * 3. Insert the reading — skip silently if it's a duplicate.
   * 4. Determine whether to create a new session or extend the existing one:
   *    a) No session exists → create if UV > 0.
   *    b) Gap from last reading > 15 min → new session (break in exposure).
   *    c) Different UTC day → new session (day boundary crossed).
   *    d) Gap from last NON-ZERO reading ≤ 15 min → extend session.
   *    e) Gap from last non-zero > 15 min → new session.
   * 5. For extended sessions: re-fetch all readings in the session window,
   *    recalculate averageUvIndex, accumulatedSed, durationSeconds, and
   *    the peak risk level, then update the session record.
   *
   * SED Accumulation:
   * For each consecutive pair of readings in the session window:
   *   SED += (uvIndex × intervalSeconds) / 4000
   *
   * @param userId   - UUID of the user who owns the device.
   * @param deviceId - UUID of the device that submitted the readings.
   * @param readings - Unsorted array of UV readings from the device payload.
   * @returns        { inserted: number, duplicates: number }
   *                 - inserted: readings successfully written to the DB
   *                 - duplicates: readings silently skipped
   */
  async processReadings(userId: string, deviceId: string, readings: {uvIndex: number, recordedAt: string}[]) {
    // Sort chronologically so SED is accumulated in the correct order
    const sorted = readings.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
    let inserted = 0;
    
    for (const r of sorted) {
      const recDate = new Date(r.recordedAt);
      // Clamp negative values (sensor noise or calibration drift) to zero
      const uvValue = Math.max(0, r.uvIndex);
      
      try {
        await this.readingRepo.createReading(deviceId, uvValue, recDate);
        inserted++;
      } catch { continue; } // Duplicate reading — DB unique constraint thrown; skip silently
      
      const lastSession = await this.exposureRepo.getLastSession(deviceId);
      
      if (!lastSession) {
        // Case a: No session exists yet — start one if this reading has UV activity
        if (uvValue > 0) await this.exposureRepo.createSession(userId, deviceId, recDate, uvValue);
        continue;
      }
      
      const lastReadingBeforeThis = await this.readingRepo.getLastReadingBefore(deviceId, recDate);
      
      // Gap in minutes between the previous reading and the current one
      const diffMinsFromLastReading = lastReadingBeforeThis 
        ? (recDate.getTime() - lastReadingBeforeThis.recordedAt.getTime()) / 60000 
        : 0;
        
      if (diffMinsFromLastReading > 15 || recDate.getUTCDay() !== lastSession.endTime.getUTCDay()) {
        // Case b/c: Long gap or new day — start a fresh session
        if (uvValue > 0) await this.exposureRepo.createSession(userId, deviceId, recDate, uvValue);
      } else {
        // Check how long since the last non-zero reading to decide extend vs. new
        const lastNonZero = await this.readingRepo.getLastNonZeroReadingBefore(deviceId, recDate);
        
        const diffFromNonZero = lastNonZero 
          ? (recDate.getTime() - lastNonZero.recordedAt.getTime()) / 60000 
          : Infinity;
          
        if (diffFromNonZero <= 15) {
          // Case d: Extend the current session with new metrics

          // The session end time only advances when UV > 0 (zero-UV readings
          // don't count as active exposure but are counted in the window)
          const newEndTime = uvValue > 0 ? recDate : lastSession.endTime;
          const duration = Math.floor((newEndTime.getTime() - lastSession.startTime.getTime()) / 1000);
          
          // Re-fetch all readings in the updated session window to recalculate metrics
          const sessionReadings = await this.readingRepo.getSessionReadings(deviceId, lastSession.startTime, newEndTime);
          const avgUv = sessionReadings.length > 0 ? sessionReadings.reduce((sum, rd) => sum + Number(rd.uvIndex), 0) / sessionReadings.length : 0;
          
          let accumulatedSed = 0;
          let maxUv = 0;
          // Accumulate SED across consecutive reading pairs in the session window
          for (let i = 1; i < sessionReadings.length; i++) {
            const prev = sessionReadings[i - 1];
            const curr = sessionReadings[i];
            const diffSecs = (curr.recordedAt.getTime() - prev.recordedAt.getTime()) / 1000;
            accumulatedSed += this.calcService.calculateSedIncrement(Number(curr.uvIndex), diffSecs);
            if (Number(curr.uvIndex) > maxUv) maxUv = Number(curr.uvIndex);
          }
          // Include the first reading in the peak UV calculation
          if (sessionReadings.length > 0 && Number(sessionReadings[0].uvIndex) > maxUv) {
            maxUv = Number(sessionReadings[0].uvIndex);
          }
          // Classify the peak UV reached during the session (not the average)
          const peakRisk = this.calcService.calculateRisk(maxUv);
          
          await this.exposureRepo.updateSession(
            lastSession.sessionId, 
            newEndTime, 
            duration, 
            avgUv, 
            accumulatedSed, 
            peakRisk
          );
        } else {
          // Case e: Non-zero gap too long — start a fresh session
          if (uvValue > 0) await this.exposureRepo.createSession(userId, deviceId, recDate, uvValue);
        }
      }
    }
    
    return { inserted, duplicates: readings.length - inserted };
  }
}
