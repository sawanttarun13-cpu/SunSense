"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
/**
 * --------------------------------------------------------
 * File: settings.service.ts
 * Layer: Service / Business Logic
 *
 * Purpose:
 * Reads and updates the user's application settings and
 * notification preferences. Uses upsert semantics so
 * settings rows are created on first update if they do
 * not already exist (e.g., for users registered before
 * the settings table was introduced).
 *
 * Settings Managed:
 * - alertThreshold      → UV Index value above which the system fires alerts
 * - emailNotifications  → Whether the user receives email-based alerts
 * - pushNotifications   → Whether the user receives push/in-app alerts
 *
 * Layer:
 * Business Logic
 *
 * Uses:
 * SettingsRepository — Reads/writes the settings and notification_preferences tables
 *
 * Does NOT:
 * Access Prisma directly.
 * --------------------------------------------------------
 */
const settings_repo_1 = require("../../repositories/settings/settings.repo");
const smart_alert_preferences_1 = require("../../utils/smart-alert-preferences");
const settingsRepo = new settings_repo_1.SettingsRepository();
class SettingsService {
    /**
     * Retrieves the user's current settings and notification preferences.
     *
     * Returns null for any field that does not yet have a row in the database,
     * allowing the frontend to show default/empty states gracefully.
     *
     * @param userId - UUID of the authenticated user.
     * @returns      { alertThreshold, emailNotifications, pushNotifications, smartAlertsEnabled, smartAlertPreferences }
     *               (each field may be null if not yet configured)
     */
    async getSettings(userId) {
        const data = await settingsRepo.findByUserId(userId);
        const prefs = (0, smart_alert_preferences_1.normalizeSmartAlertPreferences)(data.preferences?.smartAlertPreferences);
        // Extract masterEnabled so we can expose it as smartAlertsEnabled to the frontend API
        const { masterEnabled, ...childPreferences } = prefs;
        return {
            alertThreshold: data.settings?.alertThreshold ?? null,
            emailNotifications: data.preferences?.emailNotifications ?? null,
            pushNotifications: data.preferences?.pushNotifications ?? null,
            smartAlertsEnabled: masterEnabled,
            smartAlertPreferences: childPreferences,
        };
    }
    /**
     * Updates the user's settings and notification preferences.
     *
     * Uses upsert (create-or-update) so the caller does not need to know
     * whether settings rows already exist. Only provided fields are updated.
     *
     * After updating, returns the freshly-read settings so the frontend
     * always receives the confirmed persisted values.
     *
     * @param userId                   - UUID of the authenticated user.
     * @param data                     - Settings payload from the request body.
     * @param data.alertThreshold      - UV Index trigger threshold (optional).
     * @param data.emailNotifications  - Email notification toggle (optional).
     * @param data.pushNotifications   - Push notification toggle (optional).
     * @param data.smartAlertsEnabled  - Master toggle for smart alerts (optional).
     * @param data.smartAlertPreferences - Specific smart alert toggles (optional).
     * @returns                        Updated settings (same as getSettings return shape).
     */
    async updateSettings(userId, data) {
        // Each upsert only runs if the relevant field is present in the payload
        await settingsRepo.upsertSettings(userId, data.alertThreshold);
        let smartAlertPrefs = undefined;
        // Build the partial update object for smart alert preferences
        if (data.smartAlertsEnabled !== undefined || data.smartAlertPreferences !== undefined) {
            smartAlertPrefs = {};
            if (typeof data.smartAlertsEnabled === 'boolean') {
                smartAlertPrefs.masterEnabled = data.smartAlertsEnabled;
            }
            if (typeof data.smartAlertPreferences === 'object' && data.smartAlertPreferences !== null) {
                // Explicitly extract and cast to booleans to prevent arbitrary JSON injection
                const allowedKeys = ['highRisk', 'extremeUv', 'rapidUvIncrease', 'burnWarning', 'reapplySunscreen'];
                for (const key of allowedKeys) {
                    if (data.smartAlertPreferences.hasOwnProperty(key)) {
                        smartAlertPrefs[key] = Boolean(data.smartAlertPreferences[key]);
                    }
                }
            }
        }
        await settingsRepo.upsertPreferences(userId, data.emailNotifications, data.pushNotifications, smartAlertPrefs);
        // Return the canonical state from the database (not just the input)
        return this.getSettings(userId);
    }
}
exports.SettingsService = SettingsService;
