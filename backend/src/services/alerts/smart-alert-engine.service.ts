import { PrismaClient, AlertType, Prisma } from '@prisma/client';
import { CalculationService } from '../calculation/calculation.service';
import { AlertsRepository } from '../../repositories/alerts/alerts.repo';
import { RealtimeEventService } from '../events/realtime.service';
import { normalizeSmartAlertPreferences } from '../../utils/smart-alert-preferences';

const prisma = new PrismaClient();
const calculationService = new CalculationService();
const alertsRepo = new AlertsRepository();

// Configurable Constants (Provisional until Phase 11 / physical calibration)
const SMART_ALERT_MAX_READING_AGE_MS = 5 * 60 * 1000; // 5 minutes
const BURN_WARNING_WINDOW_MINUTES = 15; // Warn when 15 mins away from burning
const RAPID_UV_DELTA = 3.0; // UVI spike threshold
const RAPID_UV_WINDOW_MS = 15 * 60 * 1000; // 15 minutes lookback
const SUNSCREEN_EXPIRY_WARNING_MS = 15 * 60 * 1000; // 15 mins before expiry

const COOLDOWN_MS = {
  HIGH_RISK: 10 * 1000, // 10 seconds for testing (was 1 hour)
  EXTREME_UV: 60 * 60 * 1000, // 1 hour
  RAPID_UV_INCREASE: 60 * 60 * 1000, // 1 hour
  BURN_WARNING: 2 * 60 * 60 * 1000 // 2 hours
};

export class SmartAlertEngineService {
  /**
   * Evaluates the latest readings and current session state to generate alerts.
   * Suppresses alerts for obsolete offline-sync data.
   */
  async evaluate(userId: string, deviceId: string, currentSessionId: string): Promise<void> {
    try {
      // 1. Fetch current state
      const [user, settings, prefsRow, currentSession, latestReadings] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.setting.findUnique({ where: { userId } }),
        prisma.notificationPreference.findUnique({ where: { userId } }),
        prisma.exposureSession.findUnique({ where: { sessionId: currentSessionId } }),
        prisma.uVReading.findMany({
          where: { deviceId },
          orderBy: { recordedAt: 'desc' },
          take: 2
        })
      ]);

      let activeSettings = settings;
      if (!activeSettings) {
        // Provide safe defaults if the user has never saved settings
        activeSettings = {
          userId,
          theme: 'system',
          timezone: 'UTC',
          alertThreshold: new Prisma.Decimal(6.0) as any
        } as any;
      }

      if (!user || !currentSession || latestReadings.length === 0) return;
      
      const prefs = normalizeSmartAlertPreferences(prefsRow?.smartAlertPreferences);
      
      // Global master toggle check
      if (!prefs.masterEnabled) {
        return;
      }

      const currentReading = latestReadings[0];
      const previousReading = latestReadings.length > 1 ? latestReadings[1] : null;

      // 2. Offline Backfill Safety
      const ageMs = Date.now() - currentReading.recordedAt.getTime();
      if (ageMs > SMART_ALERT_MAX_READING_AGE_MS) {
        // Historical backfill - skip real-time alerts
        return;
      }

      const currentUv = currentReading.uvIndex.toNumber();
      const previousUv = previousReading ? previousReading.uvIndex.toNumber() : 0;

      // 3. Evaluate Thresholds

      // EXTREME_UV (Crossing 11.0)
      if (prefs.extremeUv && currentUv >= 11.0) {
        await this.triggerAlertIfCooledDown(
          userId,
          AlertType.EXTREME_UV,
          'UV Index is EXTREME (11+). Maximum protection required. Avoid sun exposure.',
          COOLDOWN_MS.EXTREME_UV
        );
      }

      // HIGH_RISK (Crossing user setting threshold)
      const threshold = activeSettings.alertThreshold ? activeSettings.alertThreshold.toNumber() : 6.0;
      if (prefs.highRisk && currentUv >= threshold) {
        await this.triggerAlertIfCooledDown(
          userId,
          AlertType.HIGH_RISK,
          `UV Index has crossed your high-risk threshold (${threshold.toFixed(1)}).`,
          COOLDOWN_MS.HIGH_RISK
        );
      }

      // RAPID_UV_INCREASE
      if (prefs.rapidUvIncrease) {
        // Find a reading close to RAPID_UV_WINDOW_MS ago
        const windowStart = new Date(currentReading.recordedAt.getTime() - RAPID_UV_WINDOW_MS - 60000);
        const windowEnd = new Date(currentReading.recordedAt.getTime() - RAPID_UV_WINDOW_MS + 60000);
        const pastReading = await prisma.uVReading.findFirst({
          where: {
            deviceId,
            recordedAt: { gte: windowStart, lte: windowEnd }
          }
        });
        if (pastReading && (currentUv - pastReading.uvIndex.toNumber() >= RAPID_UV_DELTA)) {
          await this.triggerAlertIfCooledDown(
            userId,
            AlertType.RAPID_UV_INCREASE,
            `Rapid UV increase detected (+${RAPID_UV_DELTA.toFixed(1)} in 15 mins).`,
            COOLDOWN_MS.RAPID_UV_INCREASE
          );
        }
      }

      // 4. Burn Warning
      const activeSunscreen = await prisma.sunscreenApplication.findFirst({
        where: { userId, expiresAt: { gt: new Date() } },
        orderBy: { appliedAt: 'desc' }
      });

      if (prefs.burnWarning) {
        const unprotectedBurnTime = calculationService.calculateUnprotectedBurnTime(currentUv, user.skinType);
        
        if (unprotectedBurnTime !== null) {
          const effectiveBurnTime = activeSunscreen 
            ? calculationService.calculateProtectedBurnTime(unprotectedBurnTime, activeSunscreen.appliedSpf)
            : unprotectedBurnTime;

          if (effectiveBurnTime !== null) {
            const sessionMinutes = currentSession.durationSeconds / 60;
            if (sessionMinutes >= effectiveBurnTime - BURN_WARNING_WINDOW_MINUTES) {
              await this.triggerAlertIfCooledDown(
                userId,
                AlertType.BURN_WARNING,
                `You are approaching your safe sun exposure limit. Seek shade soon.`,
                COOLDOWN_MS.BURN_WARNING
              );
            }
          }
        }
      }

      // 5. Sunscreen Expiry
      if (prefs.reapplySunscreen && activeSunscreen) {
        const timeUntilExpiry = activeSunscreen.expiresAt.getTime() - Date.now();
        if (timeUntilExpiry <= SUNSCREEN_EXPIRY_WARNING_MS && timeUntilExpiry > 0) {
          // Use referenceId for exact deduplication (1 alert per sunscreen application)
          await this.triggerAlertWithReference(
            userId,
            AlertType.REAPPLY_SUNSCREEN,
            `Your sunscreen will expire in ${Math.round(timeUntilExpiry / 60000)} minutes. Please reapply.`,
            activeSunscreen.id
          );
        }
      }

    } catch (error) {
      console.error('[SmartAlertEngine] Evaluation failed:', error);
      // Safe to swallow - we never want alert failure to fail ingestion
    }
  }

  private async triggerAlertIfCooledDown(userId: string, type: AlertType, message: string, cooldownMs: number) {
    const sinceTime = new Date(Date.now() - cooldownMs);
    const recentAlert = await alertsRepo.getLastAlertOfType(userId, type, sinceTime);
    if (!recentAlert) {
      await this.persistAndEmit(userId, type, message);
    }
  }

  private async triggerAlertWithReference(userId: string, type: AlertType, message: string, referenceId: string) {
    try {
      await this.persistAndEmit(userId, type, message, referenceId);
    } catch (error: any) {
      // P2002 Unique Constraint Violation means this referenceId was already alerted
      if (error.code !== 'P2002') {
        throw error;
      }
    }
  }

  private async persistAndEmit(userId: string, type: AlertType, message: string, referenceId?: string) {
    const alert = await alertsRepo.createAlert(userId, type, message, referenceId);
    // Only emit after successful DB persistence
    const realtimeEventService = new RealtimeEventService();
    realtimeEventService.emitNewAlert(userId, alert);
  }
}

export const smartAlertEngine = new SmartAlertEngineService();
