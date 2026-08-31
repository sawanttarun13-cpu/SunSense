import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log('No users found');
    return;
  }

  const now = new Date();
  
  // Clear existing alerts to prevent duplicates
  await prisma.alert.deleteMany({});
  
  // Seed for ALL users so the frontend always sees them regardless of who is logged in
  for (const user of users) {
    await prisma.alert.createMany({
      data: [
        // --- EXTREME (EXTREME_UV) ---
        {
          userId: user.id,
          type: 'EXTREME_UV',
          message: 'UV Index is EXTREME (11+). Maximum protection required. Avoid sun exposure.',
          triggeredAt: new Date(now.getTime() - 1000 * 60 * 5),
          isRead: false,
        },
        {
          userId: user.id,
          type: 'EXTREME_UV',
          message: 'UV levels have remained EXTREME for over 30 minutes.',
          triggeredAt: new Date(now.getTime() - 1000 * 60 * 35),
          isRead: true,
        },

        // --- CRITICAL (HIGH_RISK / RAPID_UV_INCREASE) ---
        {
          userId: user.id,
          type: 'HIGH_RISK',
          message: 'UV Index has jumped to HIGH (7.5). Please put on protective clothing.',
          triggeredAt: new Date(now.getTime() - 1000 * 60 * 45),
          isRead: false,
        },
        {
          userId: user.id,
          type: 'RAPID_UV_INCREASE',
          message: 'Cloud cover is breaking! UV is increasing rapidly.',
          triggeredAt: new Date(now.getTime() - 1000 * 60 * 65),
          isRead: false,
        },

        // --- WARNING (BURN_WARNING / BATTERY_LOW) ---
        {
          userId: user.id,
          type: 'BURN_WARNING',
          message: 'You are approaching your safe sun exposure limit. Seek shade soon.',
          triggeredAt: new Date(now.getTime() - 1000 * 60 * 120),
          isRead: false,
        },
        {
          userId: user.id,
          type: 'BATTERY_LOW',
          message: 'Device battery is below 20%. Please charge it when you get inside.',
          triggeredAt: new Date(now.getTime() - 1000 * 60 * 60 * 24),
          isRead: true,
        },

        // --- INFO (REAPPLY_SUNSCREEN) ---
        {
          userId: user.id,
          type: 'REAPPLY_SUNSCREEN',
          message: 'It has been 2 hours since you last applied sunscreen. Time to reapply!',
          triggeredAt: new Date(now.getTime() - 1000 * 60 * 180),
          isRead: false,
        },
        {
          userId: user.id,
          type: 'REAPPLY_SUNSCREEN',
          message: 'Sunscreen protection efficiency is dropping due to prolonged exposure.',
          triggeredAt: new Date(now.getTime() - 1000 * 60 * 360),
          isRead: true,
        },

        // --- RESOLVED (OFFLINE_SYNC) ---
        {
          userId: user.id,
          type: 'OFFLINE_SYNC',
          message: 'Device reconnected successfully and synced 24 offline readings.',
          triggeredAt: new Date(now.getTime() - 1000 * 60 * 60 * 5),
          isRead: true,
        },
        {
          userId: user.id,
          type: 'OFFLINE_SYNC',
          message: 'Network issue resolved. Device back online.',
          triggeredAt: new Date(now.getTime() - 1000 * 60 * 60 * 48),
          isRead: true,
        }
      ]
    });
  }
  
  console.log('Seeded 10 mock alerts for ALL users!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
