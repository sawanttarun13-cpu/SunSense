"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadingRepository = void 0;
const prisma_1 = require("../../config/prisma");
class ReadingRepository {
    async createReading(deviceId, uvIndex, recordedAt) {
        return prisma_1.prisma.uVReading.create({ data: { deviceId, uvIndex, recordedAt } });
    }
    async getLastReadingBefore(deviceId, recordedAt) {
        return prisma_1.prisma.uVReading.findFirst({
            where: { deviceId, recordedAt: { lt: recordedAt } },
            orderBy: { recordedAt: 'desc' }
        });
    }
    async getLastNonZeroReadingBefore(deviceId, recordedAt) {
        return prisma_1.prisma.uVReading.findFirst({
            where: { deviceId, uvIndex: { gt: 0 }, recordedAt: { lte: recordedAt } },
            orderBy: { recordedAt: 'desc' }
        });
    }
    async getSessionReadings(deviceId, startTime, endTime) {
        return prisma_1.prisma.uVReading.findMany({
            where: { deviceId, recordedAt: { gte: startTime, lte: endTime } },
            orderBy: { recordedAt: 'asc' }
        });
    }
}
exports.ReadingRepository = ReadingRepository;
