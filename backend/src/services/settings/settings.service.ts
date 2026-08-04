import { SettingsRepository } from '../../repositories/settings/settings.repo';
const settingsRepo = new SettingsRepository();

export class SettingsService {
  async getSettings(userId: string) {
    const data = await settingsRepo.findByUserId(userId);
    return {
      alertThreshold: data.settings?.alertThreshold ?? null,
      emailNotifications: data.preferences?.emailNotifications ?? null,
      pushNotifications: data.preferences?.pushNotifications ?? null,
    };
  }
  async updateSettings(userId: string, data: any) {
    await settingsRepo.upsertSettings(userId, data.alertThreshold);
    await settingsRepo.upsertPreferences(userId, data.emailNotifications, data.pushNotifications);
    return this.getSettings(userId);
  }
}
