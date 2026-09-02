"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileRepository = void 0;
/**
 * --------------------------------------------------------
 * File: profile.repo.ts
 * Layer: Repository / Data Access
 *
 * Purpose:
 * Provides read and update access to user profile fields
 * in the `users` table. Uses Prisma `select` to explicitly
 * control which columns are returned, ensuring the
 * passwordHash column is NEVER included in profile responses.
 *
 * Table Managed:
 * users (profile fields only — no password access)
 *
 * Used By:
 * ProfileService — Read and update user profile
 *
 * Security:
 * Both `findById` and `update` use explicit `select` clauses
 * that deliberately omit `passwordHash`. This is a defence-in-
 * depth measure on top of the service layer filtering.
 * --------------------------------------------------------
 */
const prisma_1 = require("../../config/prisma");
class ProfileRepository {
    /**
     * Returns the user's public profile fields.
     *
     * The `select` clause explicitly includes only safe fields.
     * `passwordHash` is NOT in the select list and will never
     * be returned, regardless of what the caller passes in `data`.
     *
     * @param userId - UUID of the user whose profile to fetch.
     * @returns      { id, email, name, skinType, preferredSpf, createdAt } or null.
     */
    async findById(userId) {
        return prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, skinType: true, preferredSpf: true, createdAt: true }
        });
    }
    /**
     * Updates the user's profile and returns the updated fields.
     *
     * The `select` clause ensures the returned object never
     * contains the passwordHash, even if `data` somehow included it.
     * Prisma will only update the fields provided in `data`.
     *
     * Updatable fields (controlled by the ProfileService):
     * - name, skinType, preferredSpf
     *
     * @param userId - UUID of the user to update.
     * @param data   - Partial Prisma UserUpdateInput (name, skinType, preferredSpf).
     * @returns      Updated profile fields: { id, email, name, skinType, preferredSpf }.
     */
    async update(userId, data) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, email: true, name: true, skinType: true, preferredSpf: true }
        });
    }
    /**
     * Retrieves aggregated lifetime stats for the user's profile.
     */
    async getStats(userId) {
        const sessions = await prisma_1.prisma.exposureSession.findMany({
            where: { userId },
            select: {
                startTime: true,
                durationSeconds: true,
                averageUvIndex: true,
                calculatedRisk: true,
            }
        });
        const uniqueDays = new Set();
        let totalUv = 0;
        let highUvDaysCount = 0;
        const highUvDays = new Set();
        let totalSeconds = 0;
        for (const session of sessions) {
            const dayKey = session.startTime.toISOString().split('T')[0];
            uniqueDays.add(dayKey);
            totalUv += Number(session.averageUvIndex);
            totalSeconds += session.durationSeconds;
            if (['HIGH', 'VERY_HIGH', 'EXTREME'].includes(session.calculatedRisk)) {
                highUvDays.add(dayKey);
            }
        }
        const daysTracked = uniqueDays.size;
        const avgDailyUv = sessions.length > 0 ? (totalUv / sessions.length) : 0;
        return {
            daysTracked,
            avgDailyUv: avgDailyUv.toFixed(1),
            highUvDays: highUvDays.size,
            totalExposureHours: Math.floor(totalSeconds / 3600),
        };
    }
}
exports.ProfileRepository = ProfileRepository;
