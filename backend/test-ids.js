const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const device = await prisma.device.findFirst({ include: { owner: true }});
  console.log("USER_ID:", device.ownerId, "DEVICE_ID:", device.id);
  const session = await prisma.exposureSession.findFirst({
    where: { deviceId: device.id },
    orderBy: { startTime: 'desc' }
  });
  console.log("SESSION_ID:", session.sessionId);
  
  // Insert an extreme reading
  const reading = await prisma.uVReading.create({
    data: {
      deviceId: device.id,
      uvIndex: 12.5,
      recordedAt: new Date()
    }
  });
  console.log("Inserted EXTREME reading:", reading);
  
  // Also insert one just 1 second ago to cross the threshold for EXTREME (needs < 11 previously)
  await prisma.uVReading.create({
    data: {
      deviceId: device.id,
      uvIndex: 5.0,
      recordedAt: new Date(Date.now() - 1000)
    }
  });
  
  console.log("Done");
}
run();
