"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceRepository = void 0;
const prisma_1 = require("../../config/prisma");
class DeviceRepository {
    async updateLastPing(deviceId, date) {
        return prisma_1.prisma.device.update({
            where: { id: deviceId },
            data: { lastPing: date }
        });
    }
}
exports.DeviceRepository = DeviceRepository;
