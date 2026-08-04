"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRepository = void 0;
const prisma_1 = require("../../config/prisma");
class DashboardRepository {
    async getOverview(userId) {
        const device = await prisma_1.prisma.device.findUnique({ where: { userId } });
        return { device };
    }
}
exports.DashboardRepository = DashboardRepository;
