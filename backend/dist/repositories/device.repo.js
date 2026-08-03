"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceRepository = void 0;
const prisma_1 = require("../config/prisma");
class DeviceRepository {
    async create(data) {
        return prisma_1.prisma.device.create({ data });
    }
    async findByUserId(userId) {
        return prisma_1.prisma.device.findUnique({ where: { userId } });
    }
    async findById(id) {
        return prisma_1.prisma.device.findUnique({ where: { id } });
    }
    async saveToken(deviceId, apiKeyHash) {
        return prisma_1.prisma.deviceToken.upsert({
            where: { deviceId },
            update: { apiKeyHash },
            create: { deviceId, apiKeyHash }
        });
    }
}
exports.DeviceRepository = DeviceRepository;
