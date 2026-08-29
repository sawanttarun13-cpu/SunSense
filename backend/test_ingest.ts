import { PrismaClient } from '@prisma/client';
import { DeviceIngestionService } from './src/services/ingestion/device-ingestion.service';
const prisma = new PrismaClient();
async function run() {
  const service = new DeviceIngestionService();
  const res = await service.processPayload('be6fc0f4-6c04-4abe-a55a-bb080e892153', 'cdea2948-f7c9-42ea-ab14-f050b4907849', [
    { uvIndex: 4.5, recordedAt: new Date().toISOString() }
  ]);
  console.log(res);
}
run();
