import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const users = await p.user.findMany();
  console.log('USERS:', users.length);
  users.forEach(u => console.log(u.id, u.email));
  const alerts = await p.alert.findMany();
  console.log('ALERTS:', alerts.length);
  alerts.forEach(a => console.log('Alert:', a.userId, a.type));
}
main().finally(() => p.$disconnect());
