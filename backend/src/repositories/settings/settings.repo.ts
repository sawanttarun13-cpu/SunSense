import { prisma } from '../../config/prisma';

export class SettingsRepository {
  async findByUserId(userId: string) {
    const settings = await prisma.setting.findUnique({ where: { userId } });
    const prefs = await prisma.notificationPreference.findUnique({ where: { userId } });
    return { settings, preferences: prefs };
  }
  
  async upsertSettings(userId: string, alertThreshold?: number) {
    if (alertThreshold === undefined) return null;
    return prisma.setting.upsert({
      where: { userId },
      update: { alertThreshold },
      create: { userId, alertThreshold }
    });
  }

  async upsertPreferences(userId: string, emailNotif?: boolean, pushNotif?: boolean) {
    if (emailNotif === undefined && pushNotif === undefined) return null;
    const defaultDate = new Date('1970-01-01T00:00:00Z');
    return prisma.notificationPreference.upsert({
      where: { userId },
      update: { emailNotifications: emailNotif, pushNotifications: pushNotif },
      create: { 
        userId, 
        emailNotifications: emailNotif ?? true, 
        pushNotifications: pushNotif ?? true,
        quietHoursStart: defaultDate,
        quietHoursEnd: defaultDate
      }
    });
  }
}
