"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRepository = void 0;
const prisma_1 = require("../../config/prisma");
class AnalyticsRepository {
    async getSessions(userId) {
        return prisma_1.prisma.exposureSession.findMany({
            where: { userId },
            orderBy: { startTime: 'asc' }
        });
    }
}
exports.AnalyticsRepository = AnalyticsRepository;
