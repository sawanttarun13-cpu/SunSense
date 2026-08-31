import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  console.log('ALERTS:', await p.alert.count());
  console.log('READINGS:', await p.uVReading.count());
}
main().finally(() => p.$disconnect());
