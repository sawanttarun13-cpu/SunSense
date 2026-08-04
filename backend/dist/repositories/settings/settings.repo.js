"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRepository = void 0;
const prisma_1 = require("../../config/prisma");
class SettingsRepository {
    async findByUserId(userId) {
        const settings = await prisma_1.prisma.setting.findUnique({ where: { userId } });
        const prefs = await prisma_1.prisma.notificationPreference.findUnique({ where: { userId } });
        return { settings, preferences: prefs };
    }
    async upsertSettings(userId, alertThreshold) {
        if (alertThreshold === undefined)
            return null;
        return prisma_1.prisma.setting.upsert({
            where: { userId },
            update: { alertThreshold },
            create: { userId, alertThreshold }
        });
    }
    async upsertPreferences(userId, emailNotif, pushNotif) {
        if (emailNotif === undefined && pushNotif === undefined)
            return null;
        const defaultDate = new Date('1970-01-01T00:00:00Z');
        return prisma_1.prisma.notificationPreference.upsert({
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
exports.SettingsRepository = SettingsRepository;
