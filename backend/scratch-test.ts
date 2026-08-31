import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Setting up test data ---');
  
  // Find a user and device to use
  const device = await prisma.device.findFirst();
  if (!device) {
    throw new Error('No devices found in DB to run test against.');
  }

  console.log(`Using Device: ${device.id}`);

  // Base time
  const baseTime = new Date('2030-01-01T10:07:00Z');

  const readings = [
    { uvIndex: 1.0, offsetSec: 0 },
    { uvIndex: 1.2, offsetSec: 10 },
    { uvIndex: 1.4, offsetSec: 20 },
    { uvIndex: 1.6, offsetSec: 30 },
    { uvIndex: 1.8, offsetSec: 40 },
    { uvIndex: 2.0, offsetSec: 50 },
  ];

  const createdReadings = [];
  try {
    console.log('Inserting 6 readings in the same minute (10:07)...');
    for (const r of readings) {
      const recAt = new Date(baseTime.getTime() + r.offsetSec * 1000);
      const inserted = await prisma.uVReading.create({
        data: {
          deviceId: device.id,
          uvIndex: r.uvIndex,
          recordedAt: recAt
        }
      });
      createdReadings.push(inserted.id);
    }

    console.log('Inserting 1 reading in the next minute (10:08)...');
    const nextMinReading = await prisma.uVReading.create({
      data: {
        deviceId: device.id,
        uvIndex: 2.5,
        recordedAt: new Date('2030-01-01T10:08:15Z')
      }
    });
    createdReadings.push(nextMinReading.id);

    console.log('--- Calling ReadingsService.getHistory ---');
    const { ReadingsService } = require('./src/services/readings/readings.service');
    const service = new ReadingsService();
    const result = await service.getHistory(device.userId, 1, 50);

    console.log('Result Data:');
    console.log(JSON.stringify(result.data.slice(0, 5), null, 2));

    const avgRow = result.data.find((d: any) => new Date(d.recordedAt).getTime() === baseTime.getTime());
    console.log('10:07 minute bucket:', avgRow);
    
    if (avgRow && avgRow.sampleCount === 6 && Math.abs(avgRow.uvIndex - 1.5) < 0.01) {
      console.log('TEST PASSED: Average, min, max, and sampleCount are correct.');
    } else {
      console.log('TEST FAILED: 10:07 bucket is missing or incorrect.');
    }

  } finally {
    console.log('--- Cleaning up test data ---');
    if (createdReadings.length > 0) {
      await prisma.uVReading.deleteMany({
        where: { id: { in: createdReadings } }
      });
      console.log(`Deleted ${createdReadings.length} synthetic readings.`);
    }
    await prisma.$disconnect();
  }
}

main().catch(console.error);
