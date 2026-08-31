"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRepository = void 0;
/**
 * --------------------------------------------------------
 * File: settings.repo.ts
 * Layer: Repository / Data Access
 *
 * Purpose:
 * Provides read and upsert access to the `settings` and
 * `notification_preferences` tables. Both tables are
 * user-scoped with a 1-to-1 relationship to the users table.
 *
 * Uses upsert (create-or-update) for writes so the caller
 * does not need to know whether a row already exists. This
 * is important because settings rows are not automatically
 * created at registration — they are created on first update.
 *
 * Tables Managed:
 * settings, notification_preferences
 *
 * Used By:
 * SettingsService — Read and update user settings
 *
 * Does NOT:
 * Contain any business logic. Queries only.
 * --------------------------------------------------------
 */
const prisma_1 = require("../../config/prisma");
class SettingsRepository {
    /**
     * Retrieves both the settings and notification preferences for a user.
     *
     * Returns null for either field if the user has not yet saved
     * settings (i.e., no row exists). The SettingsService uses
     * null-coalescing to return null to the frontend gracefully.
     *
     * @param userId - UUID of the authenticated user.
     * @returns      { settings: Setting | null, preferences: NotificationPreference | null }
     */
    async findByUserId(userId) {
        const settings = await prisma_1.prisma.setting.findUnique({ where: { userId } });
        const prefs = await prisma_1.prisma.notificationPreference.findUnique({ where: { userId } });
        return { settings, preferences: prefs };
    }
    /**
     * Creates or updates the user's UV alert threshold setting.
     *
     * If `alertThreshold` is undefined (not provided in the request body),
     * the function short-circuits without touching the database.
     * This prevents accidental null overwrites when the user
     * only wants to update notification preferences.
     *
     * @param userId         - UUID of the authenticated user.
     * @param alertThreshold - New UV Index threshold for alert generation. Optional.
     * @returns              The upserted Setting record, or null if alertThreshold was not provided.
     */
    async upsertSettings(userId, alertThreshold) {
        if (alertThreshold === undefined)
            return null;
        return prisma_1.prisma.setting.upsert({
            where: { userId },
            update: { alertThreshold },
            create: { userId, alertThreshold }
        });
    }
    /**
     * Creates or updates the user's notification preferences.
     *
     * If no parameters are provided, short-circuits without touching the database.
     *
     * Default values for quietHoursStart/End are set to midnight UTC
     * (1970-01-01T00:00:00Z) on initial creation because PostgreSQL's
     * TIME column requires a non-null value. These will be made configurable
     * in a future phase when the quiet hours UI is implemented.
     *
     * @param userId               - UUID of the authenticated user.
     * @param emailNotif           - Toggle email notifications. Optional.
     * @param pushNotif            - Toggle push notifications. Optional.
     * @param smartAlertPrefs      - Partial updates for smart alert preferences. Optional.
     * @returns                    The upserted NotificationPreference record, or null if nothing was provided.
     */
    async upsertPreferences(userId, emailNotif, pushNotif, smartAlertPrefs) {
        if (emailNotif === undefined && pushNotif === undefined && smartAlertPrefs === undefined) {
            return null;
        }
        // Default placeholder for quietHours — required by the DB schema.
        // Will be replaced with actual user-configurable times in Phase 8.
        const defaultDate = new Date('1970-01-01T00:00:00Z');
        let newSmartAlertPreferences = undefined;
        if (smartAlertPrefs !== undefined) {
            const existingPrefs = await prisma_1.prisma.notificationPreference.findUnique({ where: { userId } });
            const currentJson = existingPrefs?.smartAlertPreferences || {};
            // Perform a shallow merge so we only update the keys explicitly provided
            newSmartAlertPreferences = {
                ...(typeof currentJson === 'object' && currentJson !== null ? currentJson : {}),
                ...smartAlertPrefs
            };
        }
        const updateData = {};
        if (emailNotif !== undefined)
            updateData.emailNotifications = emailNotif;
        if (pushNotif !== undefined)
            updateData.pushNotifications = pushNotif;
        if (newSmartAlertPreferences !== undefined)
            updateData.smartAlertPreferences = newSmartAlertPreferences;
        // For create, we merge defaults with provided prefs
        const createSmartAlertPrefs = newSmartAlertPreferences !== undefined
            ? newSmartAlertPreferences
            : (smartAlertPrefs || {});
        return prisma_1.prisma.notificationPreference.upsert({
            where: { userId },
            update: updateData,
            create: {
                userId,
                emailNotifications: emailNotif ?? true,
                pushNotifications: pushNotif ?? true,
                smartAlertPreferences: createSmartAlertPrefs,
                quietHoursStart: defaultDate,
                quietHoursEnd: defaultDate
            }
        });
    }
}
exports.SettingsRepository = SettingsRepository;
