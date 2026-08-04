import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export class ProfileRepository {
  async findById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, skinType: true, preferredSpf: true, createdAt: true } });
  }
  async update(userId: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id: userId }, data, select: { id: true, email: true, name: true, skinType: true, preferredSpf: true } });
  }
}
