import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const readings = await prisma.uVReading.findMany({
    orderBy: { recordedAt: 'desc' },
    take: 10
  });
  console.log("Latest Readings:");
  console.table(readings);

  const sessions = await prisma.exposureSession.findMany({
    orderBy: { startTime: 'desc' },
    take: 5
  });
  console.log("\nLatest Sessions:");
  console.table(sessions);
}

main().catch(console.error).finally(() => prisma.$disconnect());
