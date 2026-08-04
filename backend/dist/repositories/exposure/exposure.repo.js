"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExposureRepository = void 0;
const prisma_1 = require("../../config/prisma");
class ExposureRepository {
    async getLastSession(deviceId) {
        return prisma_1.prisma.exposureSession.findFirst({
            where: { deviceId },
            orderBy: { endTime: 'desc' }
        });
    }
    async createSession(userId, deviceId, startTime, uvValue) {
        return prisma_1.prisma.exposureSession.create({
            data: {
                userId, deviceId, startTime, endTime: startTime,
                durationSeconds: 0, averageUvIndex: uvValue, accumulatedSed: 0, calculatedRisk: 'LOW'
            }
        });
    }
    async updateSession(sessionId, endTime, durationSeconds, averageUvIndex, accumulatedSed, calculatedRisk) {
        return prisma_1.prisma.exposureSession.update({
            where: { sessionId },
            data: { endTime, durationSeconds, averageUvIndex, accumulatedSed, calculatedRisk }
        });
    }
}
exports.ExposureRepository = ExposureRepository;
