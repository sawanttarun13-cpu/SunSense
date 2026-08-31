"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SunscreenRepository = void 0;
/**
 * --------------------------------------------------------
 * File: sunscreen.repo.ts
 * Layer: Repository / Data Access
 *
 * Purpose:
 * Provides write and read access to the `sunscreen_applications`
 * table. Records when users apply sunscreen (with SPF and
 * expiry time) and retrieves the most recent application
 * to power the sunscreen protection countdown on the dashboard.
 *
 * Table Managed:
 * sunscreen_applications
 *
 * Used By:
 * SunscreenService — Create application records; retrieve active application
 * DashboardRepository — Reads latest application via its own query
 *
 * Does NOT:
 * Contain any business logic. Queries only.
 * --------------------------------------------------------
 */
const prisma_1 = require("../../config/prisma");
class SunscreenRepository {
    /**
     * Creates a new sunscreen application record.
     *
     * The `expiresAt` value is calculated by SunscreenService
     * (appliedAt + 120 minutes) before being passed here.
     * This repository only persists the pre-calculated expiry.
     *
     * @param userId     - UUID of the user who applied the sunscreen.
     * @param appliedSpf - SPF value of the product applied.
     * @param appliedAt  - Timestamp when the user applied the sunscreen.
     * @param expiresAt  - Timestamp when the protection expires (appliedAt + 2h).
     * @returns          The newly created SunscreenApplication record.
     */
    async createApplication(userId, appliedSpf, appliedAt, expiresAt) {
        return prisma_1.prisma.sunscreenApplication.create({
            data: { userId, appliedSpf, appliedAt, expiresAt }
        });
    }
    /**
     * Returns the most recently applied sunscreen for the user.
     *
     * Ordered by appliedAt descending so the newest application
     * is returned first. The SunscreenService checks whether this
     * application is still within its expiry window.
     *
     * Note: This query always returns the latest record regardless
     * of whether it has expired. Expiry checking is the responsibility
     * of SunscreenService, not this repository.
     *
     * @param userId - UUID of the user.
     * @returns      The most recent SunscreenApplication, or null if none exists.
     */
    async getActiveApplication(userId) {
        return prisma_1.prisma.sunscreenApplication.findFirst({
            where: { userId },
            orderBy: { appliedAt: 'desc' }
        });
    }
    /**
     * Deletes the most recent sunscreen application for the user.
     */
    async deleteActiveApplication(userId) {
        const app = await this.getActiveApplication(userId);
        if (app) {
            return prisma_1.prisma.sunscreenApplication.delete({
                where: { id: app.id }
            });
        }
        return null;
    }
}
exports.SunscreenRepository = SunscreenRepository;
