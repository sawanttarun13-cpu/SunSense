"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const settings_repo_1 = require("../../repositories/settings/settings.repo");
const settingsRepo = new settings_repo_1.SettingsRepository();
class SettingsService {
    async getSettings(userId) {
        const data = await settingsRepo.findByUserId(userId);
        return {
            alertThreshold: data.settings?.alertThreshold || 5.0,
            emailNotifications: data.preferences?.emailNotifications ?? true,
            pushNotifications: data.preferences?.pushNotifications ?? true,
        };
    }
    async updateSettings(userId, data) {
        await settingsRepo.upsertSettings(userId, data.alertThreshold);
        await settingsRepo.upsertPreferences(userId, data.emailNotifications, data.pushNotifications);
        return this.getSettings(userId);
    }
}
exports.SettingsService = SettingsService;
