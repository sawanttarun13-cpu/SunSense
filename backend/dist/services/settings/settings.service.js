"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const settings_repo_1 = require("../../repositories/settings/settings.repo");
const settingsRepo = new settings_repo_1.SettingsRepository();
class SettingsService {
    async getSettings(userId) {
        const data = await settingsRepo.findByUserId(userId);
        return {
            alertThreshold: data.settings?.alertThreshold ?? null,
            emailNotifications: data.preferences?.emailNotifications ?? null,
            pushNotifications: data.preferences?.pushNotifications ?? null,
        };
    }
    async updateSettings(userId, data) {
        await settingsRepo.upsertSettings(userId, data.alertThreshold);
        await settingsRepo.upsertPreferences(userId, data.emailNotifications, data.pushNotifications);
        return this.getSettings(userId);
    }
}
exports.SettingsService = SettingsService;
