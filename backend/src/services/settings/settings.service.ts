import { SettingsRepository } from '../../repositories/settings/settings.repo';
const settingsRepo = new SettingsRepository();

export class SettingsService {
  async getSettings(userId: string) {
    const data = await settingsRepo.findByUserId(userId);
    return {
      alertThreshold: data.settings?.alertThreshold || 5.0,
      emailNotifications: data.preferences?.emailNotifications ?? true,
      pushNotifications: data.preferences?.pushNotifications ?? true,
    };
  }
  async updateSettings(userId: string, data: any) {
    await settingsRepo.upsertSettings(userId, data.alertThreshold);
    await settingsRepo.upsertPreferences(userId, data.emailNotifications, data.pushNotifications);
    return this.getSettings(userId);
  }
}
