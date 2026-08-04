"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryRepository = void 0;
const prisma_1 = require("../../config/prisma");
class HistoryRepository {
    async findMany(userId, skip, take, startDate, endDate) {
        const where = { userId };
        if (startDate || endDate) {
            where.startTime = {};
            if (startDate)
                where.startTime.gte = startDate;
            if (endDate)
                where.startTime.lte = endDate;
        }
        const [data, total] = await Promise.all([
            prisma_1.prisma.exposureSession.findMany({ where, skip, take, orderBy: { startTime: 'desc' } }),
            prisma_1.prisma.exposureSession.count({ where })
        ]);
        return { data, total };
    }
    async findById(userId, id) {
        return prisma_1.prisma.exposureSession.findFirst({ where: { sessionId: id, userId } });
    }
}
exports.HistoryRepository = HistoryRepository;
