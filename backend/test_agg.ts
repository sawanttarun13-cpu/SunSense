import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`
    SELECT 
      device_id as "deviceId",
      to_timestamp(floor((extract('epoch' from recorded_at) / 900 )) * 900) as "recordedAt",
      AVG(uv_index) as "averageUvIndex"
    FROM uv_readings
    WHERE recorded_at >= NOW() - INTERVAL '7 days'
    GROUP BY device_id, to_timestamp(floor((extract('epoch' from recorded_at) / 900 )) * 900)
    ORDER BY "recordedAt" DESC
    LIMIT 5;
  `;
  console.log(result);
}
main().finally(() => prisma.$disconnect());
