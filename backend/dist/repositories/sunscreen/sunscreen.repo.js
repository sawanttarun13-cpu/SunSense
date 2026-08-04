"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SunscreenRepository = void 0;
const prisma_1 = require("../../config/prisma");
class SunscreenRepository {
    async createApplication(userId, appliedSpf, appliedAt, expiresAt) {
        return prisma_1.prisma.sunscreenApplication.create({
            data: { userId, appliedSpf, appliedAt, expiresAt }
        });
    }
    async getActiveApplication(userId) {
        return prisma_1.prisma.sunscreenApplication.findFirst({
            where: { userId },
            orderBy: { appliedAt: 'desc' }
        });
    }
}
exports.SunscreenRepository = SunscreenRepository;
