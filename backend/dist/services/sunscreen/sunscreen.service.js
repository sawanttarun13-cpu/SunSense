"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SunscreenService = void 0;
/**
 * --------------------------------------------------------
 * File: sunscreen.service.ts
 * Layer: Service / Business Logic
 *
 * Purpose:
 * Manages the sunscreen application tracker. Handles
 * recording when a user applies sunscreen, calculating
 * the expiry time, and determining how many minutes of
 * protection remain at any given moment.
 *
 * Business Rule:
 * Sunscreen expires exactly 2 hours (120 minutes) after
 * application, regardless of SPF. The SPF value is stored
 * for record-keeping and analytics, but the expiry window
 * is fixed per dermatological guidelines.
 *
 * Layer:
 * Business Logic
 *
 * Uses:
 * SunscreenRepository — Persists and retrieves sunscreen application records
 *
 * Does NOT:
 * Access Prisma directly.
 * --------------------------------------------------------
 */
const sunscreen_repo_1 = require("../../repositories/sunscreen/sunscreen.repo");
const realtime_service_1 = require("../events/realtime.service");
class SunscreenService {
    repo = new sunscreen_repo_1.SunscreenRepository();
    realtime = new realtime_service_1.RealtimeEventService();
    /**
     * Records a new sunscreen application and calculates when it will expire.
     *
     * Expiry Formula:
     *   expiresAt = appliedAt + 120 minutes (2 hours)
     *
     * The 2-hour window is based on medical guidance that sweat, water,
     * and UV degradation render most SPF products ineffective after 2 hours.
     *
     * @param userId     - UUID of the user applying sunscreen.
     * @param appliedSpf - SPF factor of the applied product (e.g., 30, 50).
     * @param appliedAt  - Exact timestamp when the sunscreen was applied.
     * @returns          The persisted sunscreen application record.
     */
    async applySunscreen(userId, appliedSpf, appliedAt) {
        // 2-hour expiry window: 120 minutes × 60,000 milliseconds/minute
        const expiresAt = new Date(appliedAt.getTime() + 120 * 60000);
        const application = await this.repo.createApplication(userId, appliedSpf, appliedAt, expiresAt);
        try {
            this.realtime.emitDashboardUpdate(userId, { timestamp: appliedAt.toISOString() });
        }
        catch (err) {
            console.error(`[RealtimeEventService] Failed to emit sunscreen dashboard update for user ${userId}:`, err);
        }
        return application;
    }
    /**
     * Retrieves the most recent sunscreen application if it has not expired.
     *
     * Returns null in two cases:
     * 1. The user has never applied sunscreen.
     * 2. The most recent application has already expired (now > expiresAt).
     *
     * @param userId - UUID of the authenticated user.
     * @returns      The active sunscreen application, or null if none/expired.
     */
    async getActiveApplication(userId) {
        const app = await this.repo.getActiveApplication(userId);
        if (!app)
            return null;
        const now = new Date();
        // If the application has passed its expiry time, treat it as inactive
        if (now > app.expiresAt)
            return null;
        return app;
    }
    /**
     * Calculates how many minutes of sunscreen protection remain.
     *
     * Formula:
     *   remainingMinutes = floor((expiresAt - now) / 60,000ms)
     *
     * Returns 0 (never negative) if the sunscreen has already expired.
     * Used by the DashboardService to display the protection countdown.
     *
     * @param expiresAt - The timestamp when the current sunscreen expires.
     * @returns         Integer minutes of protection remaining (≥ 0).
     *
     * @example
     * sunscreenService.calculateRemainingMinutes(futureDate); // → 87 (minutes)
     * sunscreenService.calculateRemainingMinutes(pastDate);   // → 0  (expired)
     */
    calculateRemainingMinutes(expiresAt) {
        const now = new Date();
        const diff = (expiresAt.getTime() - now.getTime()) / 60000;
        return Math.max(0, Math.floor(diff));
    }
}
exports.SunscreenService = SunscreenService;
