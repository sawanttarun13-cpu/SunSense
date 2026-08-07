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
const dashboardRepo = new dashboard_repo_1.DashboardRepository();
const calcService = new calculation_service_1.CalculationService();
const sunscreenService = new sunscreen_service_1.SunscreenService();
class DashboardService {
    /**
     * Builds the complete dashboard metrics payload for the authenticated user.
     *
     * If the user has no registered device, returns a minimal payload with
     * `deviceConnected: false` so the frontend can show the pairing screen.
     *
     * Calculation Notes:
     * - "Today" is defined as midnight UTC to now UTC (to avoid timezone
     *   ambiguity in a globally-deployable system).
     * - Peak UV is the maximum UV reading recorded today.
     * - Average UV is the mean across all today's readings.
     * - Current UV is the most recent reading (ordered desc).
     * - Device is ONLINE if its lastPing is within the past 5 minutes (300,000ms).
     * - Protection is ACTIVE if the latest sunscreen application has not expired.
     *
     * @param userId - UUID of the authenticated user.
     * @returns      Complete dashboard payload or { deviceConnected: false } if no device.
     */
    async getDashboard(userId) {
        const device = await dashboardRepo.getDevice(userId);
        const user = await dashboardRepo.getUser(userId);
        if (!device) {
            // User has not yet registered an ESP8266 device — show the pairing flow
            return { deviceConnected: false, error: 'No device found' };
        }
        // Define "today" as the start of the current UTC day
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const sessions = await dashboardRepo.getTodaySessions(device.id, startOfDay);
        const readings = await dashboardRepo.getTodayReadings(device.id, startOfDay);
        const sunscreen = await dashboardRepo.getLatestSunscreen(userId);
        // Sum all today's sessions for total exposure time and UV dose
        const todayExposure = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
        const todayDose = sessions.reduce((sum, s) => sum + Number(s.accumulatedSed), 0);
        // Compute peak and average UV from today's raw readings
        let peakUv = 0;
        let sumUv = 0;
        for (const r of readings) {
            const val = Number(r.uvIndex);
            if (val > peakUv)
                peakUv = val;
            sumUv += val;
        }
        const averageUv = readings.length > 0 ? sumUv / readings.length : 0;
        // Most recent reading (getTodayReadings returns ordered desc)
        const currentUv = readings.length > 0 ? Number(readings[0].uvIndex) : 0;
        // Run CalculationService formulas on the current UV reading
        const currentRisk = calcService.calculateRisk(currentUv);
        const skinType = user?.skinType || 3; // Default to Type 3 if user profile is missing
        const currentSpfRecommendation = calcService.recommendSpf(currentUv, skinType);
        // Determine if the device is online (last heartbeat within 5 minutes)
        const lastPing = device.lastPing;
        const isOnline = lastPing ? (new Date().getTime() - lastPing.getTime()) < 300000 : false;
        // Determine sunscreen protection status
        let activeProtection = false;
        let protectionRemaining = 0;
        if (sunscreen) {
            const remaining = sunscreenService.calculateRemainingMinutes(sunscreen.expiresAt);
            if (remaining > 0) {
                activeProtection = true;
                protectionRemaining = remaining;
            }
        }
        return {
            deviceConnected: true,
            deviceStatus: isOnline ? 'ONLINE' : 'OFFLINE',
            batteryStatus: device.batteryLevel || null,
            lastSync: lastPing,
            todayExposure,
            todayDose,
            peakUv,
            averageUv,
            currentUv,
            currentRisk,
            currentSpfRecommendation,
            activeProtection,
            protectionRemaining
        };
    }
}
exports.DashboardService = DashboardService;
