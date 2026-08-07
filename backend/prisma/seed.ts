/* eslint-disable no-console */
import { PrismaClient, RiskLevel, SyncStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ─── 1. Create test user ──────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('TestPass@2026', 12);

  const user = await prisma.user.upsert({
    where: { email: 'test@sunsense.dev' },
    update: {},
    create: {
      email: 'test@sunsense.dev',
      passwordHash,
      name: 'Test User',
      skinType: 3,
      preferredSpf: 30,
    },
  });
  console.log(`✅ User created: ${user.email} (id: ${user.id})`);

  // ─── 2. Create device (MVP: 1 user → 1 device) ───────────────────────────
  const device = await prisma.device.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      name: 'SunSense ESP8266',
      firmwareVersion: '1.0.0',
      batteryLevel: 85,
      wifiSsid: 'SunSense-Network',
      ipAddress: '192.168.1.100',
      lastPing: new Date(),
    },
  });
  console.log(`✅ Device created: ${device.name} (id: ${device.id})`);

  // ─── 3. Create device token (API key for device auth) ────────────────────
  const rawApiKey = 'test-api-key-sunsense-2026';
  const apiKeyHash = await bcrypt.hash(rawApiKey, 12);

  await prisma.deviceToken.upsert({
    where: { deviceId: device.id },
    update: {},
    create: {
      deviceId: device.id,
      apiKeyHash,
    },
  });
  console.log(`✅ Device token created (raw key for testing: ${rawApiKey})`);

  // ─── 4. Create settings ──────────────────────────────────────────────────
  await prisma.setting.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      alertThreshold: 6.0,
    },
  });
  console.log(`✅ Settings created (alertThreshold: 6.0)`);

  // ─── 5. Create notification preferences ──────────────────────────────────
  const midnight = new Date('1970-01-01T22:00:00Z');
  const morning  = new Date('1970-01-01T07:00:00Z');

  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      emailNotifications: true,
      pushNotifications: true,
      smartAlertPreferences: {},
      reminderPreferences: {},
      quietHoursStart: midnight,
      quietHoursEnd: morning,
    },
  });
  console.log(`✅ Notification preferences created`);

  // ─── 6. Create UV readings ────────────────────────────────────────────────
  const today = new Date();
  today.setUTCHours(10, 0, 0, 0);

  const readingsData = [
    { offsetMinutes: 0,  uvIndex: 2.1 },
    { offsetMinutes: 30, uvIndex: 4.3 },
    { offsetMinutes: 60, uvIndex: 6.7 },
    { offsetMinutes: 90, uvIndex: 8.2 },
    { offsetMinutes: 120, uvIndex: 9.5 },
    { offsetMinutes: 150, uvIndex: 7.8 },
    { offsetMinutes: 180, uvIndex: 5.4 },
    { offsetMinutes: 210, uvIndex: 3.1 },
  ];

  for (const r of readingsData) {
    const recordedAt = new Date(today.getTime() + r.offsetMinutes * 60000);
    await prisma.uVReading.upsert({
      where: { deviceId_recordedAt: { deviceId: device.id, recordedAt } },
      update: {},
      create: { deviceId: device.id, uvIndex: r.uvIndex, recordedAt },
    });
  }
  console.log(`✅ ${readingsData.length} UV readings created`);

  // ─── 7. Create exposure session ───────────────────────────────────────────
  const sessionStart = new Date(today.getTime() + 30 * 60000); // 10:30
  const sessionEnd   = new Date(today.getTime() + 210 * 60000); // 13:30

  await prisma.exposureSession.create({
    data: {
      userId: user.id,
      deviceId: device.id,
      startTime: sessionStart,
      endTime: sessionEnd,
      durationSeconds: 180 * 60, // 3 hours
      averageUvIndex: 6.7,
      accumulatedSed: 1.81,      // calculated from SED formula
      calculatedRisk: RiskLevel.HIGH,
    },
  });
  console.log(`✅ Exposure session created (3h, avgUVI: 6.7, SED: 1.81, Risk: HIGH)`);

  // ─── 8. Create sunscreen application ────────────────────────────────────
  const appliedAt = new Date(today.getTime() + 20 * 60000); // 10:20
  const expiresAt = new Date(appliedAt.getTime() + 120 * 60000); // 2 hours

  await prisma.sunscreenApplication.create({
    data: {
      userId: user.id,
      appliedSpf: 30,
      appliedAt,
      expiresAt,
    },
  });
  console.log(`✅ Sunscreen application created (SPF 30, applied at 10:20)`);

  // ─── 9. Create device sync log ───────────────────────────────────────────
  await prisma.deviceSyncLog.create({
    data: {
      deviceId: device.id,
      syncTime: new Date(),
      recordsUploaded: readingsData.length,
      status: SyncStatus.SUCCESS,
    },
  });
  console.log(`✅ Device sync log created`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('   Email:    test@sunsense.dev');
  console.log('   Password: TestPass@2026');
  console.log(`   Device ID: ${device.id}`);
  console.log(`   API Key:   ${rawApiKey}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
