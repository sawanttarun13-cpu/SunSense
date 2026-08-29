import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const now = new Date();
  const delReadings = await prisma.uVReading.deleteMany({ where: { recordedAt: { gt: now } } });
  console.log('Deleted ' + delReadings.count + ' future readings.');
  const delSessions = await prisma.exposureSession.deleteMany({ where: { startTime: { gt: now } } });
  console.log('Deleted ' + delSessions.count + ' future sessions.');
  const badSessions = await prisma.exposureSession.deleteMany({ where: { durationSeconds: { lt: 0 } } });
  console.log('Deleted ' + badSessions.count + ' sessions with negative duration.');
}
main();
