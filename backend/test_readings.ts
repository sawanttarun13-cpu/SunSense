import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const latest = await prisma.exposureSession.findMany({ orderBy: { startTime: 'desc' }, take: 10 });
  console.log(JSON.stringify(latest, null, 2));
}
main().finally(() => prisma.$disconnect());
