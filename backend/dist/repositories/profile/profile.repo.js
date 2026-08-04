"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileRepository = void 0;
const prisma_1 = require("../../config/prisma");
class ProfileRepository {
    async findById(userId) {
        return prisma_1.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, skinType: true, preferredSpf: true, createdAt: true } });
    }
    async update(userId, data) {
        return prisma_1.prisma.user.update({ where: { id: userId }, data, select: { id: true, email: true, name: true, skinType: true, preferredSpf: true } });
    }
}
exports.ProfileRepository = ProfileRepository;
