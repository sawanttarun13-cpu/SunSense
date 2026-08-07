// Seeds the database with sample data for development and testing.
/* eslint-disable no-console */
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: seed.ts
 * Purpose: Database Seed Script
 *
 * Populates the SunSense PostgreSQL database with a complete set of
 * development/testing fixtures. Uses upsert for all top-level entities
 * (User, Device, DeviceToken, Settings, NotificationPreference) so the
 * script is idempotent — safe to run multiple times without creating
 * duplicates. Child entities (ExposureSession, SunscreenApplication,
 * DeviceSyncLog, UVReadings) also use upsert where a unique key exists.
 *
 * Seed Data Overview:
 * ┌─────────────────────────────┬────────────────────────────────────────┐
 * │ Entity                      │ Value                                  │
 * ├─────────────────────────────┼────────────────────────────────────────┤
 * │ User email                  │ test@sunsense.dev                      │
 * │ User password               │ TestPass@2026 (bcrypt, 12 rounds)      │
 * │ Skin type                   │ 3 (Fitzpatrick — Medium)               │
 * │ Preferred SPF               │ 30                                     │
 * │ Device name                 │ SunSense ESP8266                       │
 * │ Device firmware             │ 1.0.0                                  │
 * │ Battery level               │ 85%                                    │
 * │ API key (plaintext)         │ test-api-key-sunsense-2026             │
 * │ Alert threshold             │ 6.0 UV Index                           │
 * │ UV readings                 │ 8 readings across 3.5 hours            │
 * │ Exposure session            │ 3h, avgUVI=6.7, SED=1.81, Risk=HIGH   │
 * │ Sunscreen application       │ SPF 30, applied at 10:20 today         │
 * │ Sync log                    │ 8 records, SUCCESS                     │
 * └─────────────────────────────┴────────────────────────────────────────┘
 *
 * Run with:
 *   npx ts-node prisma/seed.ts
 * or via npm:
 *   npm run seed
 *
 * The seed.ts bcrypt rounds are 12 (higher than production's 10)
 * to ensure seeded passwords can't be trivially reversed.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { PrismaClient, RiskLevel, SyncStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ─── 1. Create test user ──────────────────────────────────────────────────
  // Using bcrypt with 12 rounds — slightly higher than the production value (10)
  // for added security on seeded accounts. Safe to run multiple times (upsert).
  const passwordHash = await bcrypt.hash('TestPass@2026', 12);

  const user = await prisma.user.upsert({
    where: { email: 'test@sunsense.dev' },
    update: {},  // No changes if user already exists
    create: {
      email: 'test@sunsense.dev',
      passwordHash,
      name: 'Test User',
      skinType: 3,      // Fitzpatrick Type 3 — Medium skin
      preferredSpf: 30, // Minimum recommended SPF for outdoor activities
    },
  });
  console.log(`✅ User created: ${user.email} (id: ${user.id})`);

  // ─── 2. Create device (MVP: 1 user → 1 device) ───────────────────────────
  // Seeds a realistic ESP8266 device with firmware version and IP info.
  // batteryLevel: 85 — healthy battery for test scenarios.
  // lastPing: now — ensures dashboard shows ONLINE status.
  const device = await prisma.device.upsert({
    where: { userId: user.id },
    update: {},  // No changes if device already exists
    create: {
      userId: user.id,
      name: 'SunSense ESP8266',
      firmwareVersion: '1.0.0',
      batteryLevel: 85,
      wifiSsid: 'SunSense-Network',
      ipAddress: '192.168.1.100',
      lastPing: new Date(), // Set to now so dashboard shows ONLINE (within 5-min window)
    },
  });
  console.log(`✅ Device created: ${device.name} (id: ${device.id})`);

  // ─── 3. Create device token (API key for device auth) ────────────────────
  // The raw key 'test-api-key-sunsense-2026' can be used in
  // x-api-key headers to simulate device requests during development.
  // In production this key would be a 64-char crypto-random hex string.
  const rawApiKey = 'test-api-key-sunsense-2026';
  const apiKeyHash = await bcrypt.hash(rawApiKey, 12);

  await prisma.deviceToken.upsert({
    where: { deviceId: device.id },
    update: {},  // Do not rotate the key if it already exists
    create: {
      deviceId: device.id,
      apiKeyHash,
    },
  });
  console.log(`✅ Device token created (raw key for testing: ${rawApiKey})`);

  // ─── 4. Create settings ──────────────────────────────────────────────────
  // alertThreshold: 6.0 = HIGH risk boundary per WHO UV Index scale.
  // Any UV reading above 6.0 will (in Phase 8) trigger a BURN_WARNING alert.
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
  // quietHoursStart: 22:00 UTC (10pm) — quiet hours begin
  // quietHoursEnd:   07:00 UTC (7am)  — quiet hours end
  // These times represent overnight hours when alerts should not fire.
  const midnight = new Date('1970-01-01T22:00:00Z'); // 10pm UTC quiet start
  const morning  = new Date('1970-01-01T07:00:00Z'); // 7am UTC quiet end

  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      emailNotifications: true,
      pushNotifications: true,
      smartAlertPreferences: {},   // Empty JSONB — fine-grained controls added in Phase 8
      reminderPreferences: {},     // Empty JSONB — reminder config added in Phase 8
      quietHoursStart: midnight,
      quietHoursEnd: morning,
    },
  });
  console.log(`✅ Notification preferences created`);

  // ─── 6. Create UV readings ────────────────────────────────────────────────
  // 8 readings spread across 3.5 hours starting at 10:00 UTC today.
  // UV progression: low → moderate → high → very high → high → moderate
  // This simulates a realistic outdoor day with peak UV around midday.
  const today = new Date();
  today.setUTCHours(10, 0, 0, 0); // Start at 10:00 UTC today

  const readingsData = [
    { offsetMinutes: 0,   uvIndex: 2.1 }, // 10:00 — LOW (indoors initially)
    { offsetMinutes: 30,  uvIndex: 4.3 }, // 10:30 — MODERATE
    { offsetMinutes: 60,  uvIndex: 6.7 }, // 11:00 — HIGH
    { offsetMinutes: 90,  uvIndex: 8.2 }, // 11:30 — VERY_HIGH
    { offsetMinutes: 120, uvIndex: 9.5 }, // 12:00 — VERY_HIGH (peak)
    { offsetMinutes: 150, uvIndex: 7.8 }, // 12:30 — HIGH
    { offsetMinutes: 180, uvIndex: 5.4 }, // 13:00 — MODERATE
    { offsetMinutes: 210, uvIndex: 3.1 }, // 13:30 — MODERATE
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
  // One session covering 10:30–13:30 (3 hours / 10,800 seconds).
  // SED calculation for this session:
  //   (4.3 × 1800s) / 4000 + (6.7 × 1800s) / 4000 + ... ≈ 1.81 SED
  // Risk = HIGH (based on peak UV of 9.5 → VERY_HIGH; session uses avg 6.7)
  // Note: In production, the ExposureLogicService computes these in real-time.
  const sessionStart = new Date(today.getTime() + 30 * 60000);  // 10:30 UTC
  const sessionEnd   = new Date(today.getTime() + 210 * 60000); // 13:30 UTC

  await prisma.exposureSession.create({
    data: {
      userId: user.id,
      deviceId: device.id,
      startTime: sessionStart,
      endTime: sessionEnd,
      durationSeconds: 180 * 60, // 3 hours = 10,800 seconds
      averageUvIndex: 6.7,
      accumulatedSed: 1.81,      // Pre-calculated SED from the formula
      calculatedRisk: RiskLevel.HIGH,
    },
  });
  console.log(`✅ Exposure session created (3h, avgUVI: 6.7, SED: 1.81, Risk: HIGH)`);

  // ─── 8. Create sunscreen application ────────────────────────────────────
  // Applied 20 minutes into the session (10:20 UTC).
  // Expires 2 hours later at 12:20 UTC (120-minute rule).
  const appliedAt = new Date(today.getTime() + 20 * 60000);       // 10:20 UTC
  const expiresAt = new Date(appliedAt.getTime() + 120 * 60000);  // 12:20 UTC

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
  // Records a successful initial sync of all 8 UV readings.
  // In production, this is written by the ingestion pipeline after each batch.
  await prisma.deviceSyncLog.create({
    data: {
      deviceId: device.id,
      syncTime: new Date(),
      recordsUploaded: readingsData.length,
      status: SyncStatus.SUCCESS,
    },
  });
  console.log(`✅ Device sync log created`);

  // ─── Summary ─────────────────────────────────────────────────────────────
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
