import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const device = await prisma.device.findFirst();
  if (!device) return console.log('No device found');
  console.log('Device ID:', device.id);
  const user = await prisma.user.findFirst();
  console.log('User ID:', user?.id);
}
run();
