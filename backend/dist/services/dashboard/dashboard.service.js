"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
/**
 * --------------------------------------------------------
 * File: dashboard.service.ts
 * Layer: Service / Business Logic
 *
 * Purpose:
 * Aggregates all the data required to render the main
 * SunSense dashboard in a single API call. Fetches data
 * from multiple repositories, runs live CalculationService
 * formulas on the most recent UV reading, and computes the
 * sunscreen protection window.
 *
 * Dashboard Data Produced:
 * - Device connection and online/offline status
 * - Battery level percentage
 * - Today's cumulative exposure time (seconds)
 * - Today's cumulative UV dose (SED)
 * - Peak UV Index for the day
 * - Average UV Index for the day
 * - Current UV Index (most recent reading)
 * - Current risk level (LOW / MODERATE / HIGH / VERY_HIGH / EXTREME)
 * - Recommended SPF for the current UV and skin type
 * - Active sunscreen protection status and minutes remaining
 *
 * Layer:
 * Business Logic / Aggregation
 *
 * Uses:
 * DashboardRepository — Fetches device, user, sessions, readings, sunscreen
 * CalculationService  — Risk level and SPF recommendation for current UV
 * SunscreenService    — Calculates remaining sunscreen protection minutes
 *
 * Does NOT:
 * Access Prisma directly. All DB queries are in DashboardRepository.
 * --------------------------------------------------------
 */
const dashboard_repo_1 = require("../../repositories/dashboard/dashboard.repo");
const calculation_service_1 = require("../calculation/calculation.service");
const sunscreen_service_1 = require("../sunscreen/sunscreen.service");
const alerts_repo_1 = require("../../repositories/alerts/alerts.repo");
const dashboardRepo = new dashboard_repo_1.DashboardRepository();
const calcService = new calculation_service_1.CalculationService();
const sunscreenService = new sunscreen_service_1.SunscreenService();
class DashboardService {
    /**
     * Builds the complete dashboard metrics payload for the authenticated user.
     *
     * @param userId   - UUID of the authenticated user.
     * @param tzOffset - Client's timezone offset in minutes.
     * @returns        Complete dashboard payload or { deviceConnected: false } if no device.
     */
    async getDashboard(userId, tzOffset = 0) {
        let device = await dashboardRepo.getDevice(userId);
        const user = await dashboardRepo.getUser(userId);
        // DEV MODE: If the current user has no device, fall back to the first
        // available device in the system.
        if (!device) {
            device = await dashboardRepo.getAnyDevice();
        }
        if (!device) {
            return { deviceConnected: false, error: 'No device found' };
        }
        // Define "today" based on the user's local timezone
        const now = new Date();
        const localNow = new Date(now.getTime() - (tzOffset * 60000));
        // Get the start of the local day (midnight) in local time, then convert back to UTC
        const localStartOfDay = new Date(Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate()));
        const startOfDay = new Date(localStartOfDay.getTime() + (tzOffset * 60000));
        const sessions = await dashboardRepo.getTodaySessions(device.id, startOfDay);
        const readings = await dashboardRepo.getTodayReadings(device.id, startOfDay);
        const sunscreen = await dashboardRepo.getLatestSunscreen(userId);
        const todayExposure = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
        const todayDose = sessions.reduce((sum, s) => sum + Number(s.accumulatedSed), 0);
        // Compute metrics from today's raw readings
        let peakUv = 0;
        let peakTime = null;
        let sumUv = 0;
        let lowUv = null;
        let lowTime = null;
        const hourlyAggregation = {};
        const currentLocalHour = localNow.getUTCHours();
        for (const r of readings) {
            const val = Number(r.uvIndex);
            const timestamp = r.recordedAt;
            if (val > peakUv) {
                peakUv = val;
                peakTime = timestamp.toISOString();
            }
            if (lowUv === null || val < lowUv) {
                lowUv = val;
                lowTime = timestamp.toISOString();
            }
            sumUv += val;
            // Group into local hours for the chart
            const localReadingTime = new Date(timestamp.getTime() - (tzOffset * 60000));
            const hourStr = String(localReadingTime.getUTCHours());
            if (hourlyAggregation[hourStr] === undefined) {
                hourlyAggregation[hourStr] = val;
            }
            else {
                if (val > hourlyAggregation[hourStr]) {
                    hourlyAggregation[hourStr] = val;
                }
            }
        }
        // Build hourly data array (24 slots)
        const hourlyData = [];
        for (let i = 0; i < 24; i++) {
            const hourStr = String(i);
            const uvVal = hourlyAggregation[hourStr] !== undefined ? hourlyAggregation[hourStr] : null;
            hourlyData.push({
                hour: `${i.toString().padStart(2, '0')}:00`,
                uv: uvVal,
                isCurrent: i === currentLocalHour
            });
        }
        const averageUv = readings.length > 0 ? sumUv / readings.length : 0;
        const lastPing = device.lastPing;
        const isOnline = lastPing ? (new Date().getTime() - lastPing.getTime()) < 150000 : false;
        const currentUv = (isOnline && readings.length > 0) ? Number(readings[0].uvIndex) : 0;
        const currentRisk = calcService.calculateRisk(currentUv);
        const skinType = user?.skinType || 3;
        const currentSpfRecommendation = calcService.recommendSpf(currentUv, skinType);
        let activeProtection = false;
        let protectionRemaining = 0;
        let activeSpf = 0;
        if (sunscreen) {
            const remaining = sunscreenService.calculateRemainingMinutes(sunscreen.expiresAt);
            if (remaining > 0) {
                activeProtection = true;
                protectionRemaining = remaining;
                activeSpf = sunscreen.appliedSpf;
            }
        }
        // Calculate burn time
        let burnTimeRemaining = null;
        if (readings.length > 0) {
            const unprotected = calcService.calculateUnprotectedBurnTime(currentUv, skinType);
            if (activeProtection) {
                burnTimeRemaining = calcService.calculateProtectedBurnTime(unprotected, activeSpf);
            }
            else {
                burnTimeRemaining = unprotected;
            }
        }
        // Fetch active alerts count
        const alertsRepo = new alerts_repo_1.AlertsRepository();
        const activeAlertsCount = await alertsRepo.countActiveAlerts(userId);
        return {
            deviceConnected: true,
            deviceStatus: isOnline ? 'ONLINE' : 'OFFLINE',
            batteryStatus: device.batteryLevel === -1 ? null : device.batteryLevel, // Ensure -1 is sent as null
            lastSync: lastPing,
            todayExposure,
            todayDose,
            peakUv,
            peakTime,
            averageUv,
            currentUv,
            lowUv,
            lowTime,
            currentRisk,
            currentSpfRecommendation,
            activeProtection,
            protectionRemaining,
            burnTimeRemaining,
            activeAlertsCount,
            hourlyData
        };
    }
}
exports.DashboardService = DashboardService;
