const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const device = await prisma.device.findFirst();
  console.log("Device ID:", device.id, "User ID:", device.userId);
  
  const { ExposureLogicService } = require('./dist/services/exposure/exposure-logic.service');
  const service = new ExposureLogicService();
  
  const readings = [
    { uvIndex: 5.0, recordedAt: new Date(Date.now() - 5000).toISOString() },
    { uvIndex: 12.5, recordedAt: new Date().toISOString() }
  ];
  
  console.log("Calling ExposureLogicService...");
  const result = await service.processReadings(device.userId, device.id, readings);
  console.log("Result:", result);
}
run();
