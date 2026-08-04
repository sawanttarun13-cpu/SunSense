"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRepository = void 0;
const prisma_1 = require("../../config/prisma");
class DashboardRepository {
    async getDevice(userId) {
        return prisma_1.prisma.device.findUnique({ where: { userId } });
    }
    async getUser(userId) {
        return prisma_1.prisma.user.findUnique({ where: { id: userId } });
    }
    async getTodaySessions(deviceId, startOfDay) {
        return prisma_1.prisma.exposureSession.findMany({
            where: { deviceId, startTime: { gte: startOfDay } }
        });
    }
    async getTodayReadings(deviceId, startOfDay) {
        return prisma_1.prisma.uVReading.findMany({
            where: { deviceId, recordedAt: { gte: startOfDay } },
            orderBy: { recordedAt: 'desc' }
        });
    }
    async getLatestSunscreen(userId) {
        return prisma_1.prisma.sunscreenApplication.findFirst({
            where: { userId },
            orderBy: { appliedAt: 'desc' }
        });
    }
}
exports.DashboardRepository = DashboardRepository;
