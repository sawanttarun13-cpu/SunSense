/**
 * =============================================================================
 * File: SunSense_Firmware.ino
 * Project: SunSense Firmware — Phase 5A
 * Target: ESP8266 NodeMCU (ESP8266 Arduino Framework)
 *
 * Purpose:
 * Main Arduino sketch for the SunSense UV monitoring keychain device.
 * Coordinates all subsystems: sensor, display, battery, Wi-Fi,
 * time synchronization, API communication, and offline queuing.
 *
 * Hardware: ESP8266 NodeMCU + GUVA-S12SD UV Sensor + 1.3" I2C OLED + TP4056
 *
 * HARDWARE STATUS: NOT YET CONNECTED (Phase 5A)
 * This firmware compiles and runs the full software architecture but
 * will produce stub/zero readings until physical hardware is connected.
 *
 * Required Arduino Libraries (install via Arduino IDE Library Manager):
 *   - ESP8266WiFi       (bundled with ESP8266 Arduino core)
 *   - ESP8266HTTPClient (bundled with ESP8266 Arduino core)
 *   - ArduinoJson       by Benoit Blanchon (v6.x or v7.x)
 *   - [HARDWARE PENDING] Adafruit SSD1306 or ThingPulse OLED library
 *
 * Arduino IDE Setup:
 *   Board: "NodeMCU 1.0 (ESP-12E Module)"
 *   Upload Speed: 115200
 *   CPU Frequency: 80MHz
 *   Flash Size: "4MB (FS:2MB OTA:~1019KB)"
 *
 * Firmware Architecture:
 *   setup() → Initialize all modules → Connect Wi-Fi → Sync time → Authenticate
 *   loop()  → State machine:
 *              1. Drive Wi-Fi reconnection (non-blocking)
 *              2. On interval: read sensor → create Reading → enqueue or send
 *              3. On interval: send heartbeat
 *              4. On reconnect: flush offline queue
 *              5. On interval: re-sync time
 *              6. Update display
 *
 * Firmware/Backend Responsibility Boundary:
 *   Firmware handles: raw measurement, UV Index calculation, timestamping,
 *                     API communication, offline queue
 *   Backend handles: SED calculation, risk levels, SPF recommendations,
 *                    exposure sessions, analytics, alerts
 * =============================================================================
 */

// ─── Core & Third-Party Libraries ─────────────────────────────────────────────
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>

// ─── Firmware Module Includes ─────────────────────────────────────────────────
#include "src/config/firmware_config.h"
#include "src/utils/Logger.h"
#include "src/models/Reading.h"
#include "src/sensors/GUVAS12SD/GUVAS12SD.h"
#include "src/display/Display.h"
#include "src/battery/Battery.h"
#include "src/connectivity/WiFiManager.h"
#include "src/api/ApiClient.h"
#include "src/time/TimeSync.h"
#include "src/storage/OfflineQueue.h"

// ─── Module Instances ─────────────────────────────────────────────────────────
static GUVAS12SD    sensor(GUVAS12SD_OUT_PIN);
static Display      display;
static Battery      battery;
static WiFiManager  wifiManager;
static ApiClient    apiClient(BACKEND_BASE_URL);
static TimeSync     timeSync;
static OfflineQueue queue;

// ─── State Tracking ───────────────────────────────────────────────────────────
static uint32_t lastReadingTime    = 0;
static uint32_t lastHeartbeatTime  = 0;
static uint32_t lastTimeSyncTime   = 0;
static uint32_t lastDisplayTime    = 0;   // Throttle display refresh (Bug #1 fix)
static uint32_t bootTime           = 0;
static bool     wasConnected       = false;   // Tracks previous connection state for reconnect detection
static bool     deviceAuthenticated = false;  // Set after successful authenticate() on boot

// ─────────────────────────────────────────────────────────────────────────────
// setup() — Arduino entry point, runs once on boot
// ─────────────────────────────────────────────────────────────────────────────
void setup() {
  bootTime = millis();

  // 1. Initialize Serial logger first
  Logger::begin();
  Logger::info("SYSTEM", "SunSense Firmware v" + String(FIRMWARE_VERSION) + " booting...");

  // 2. Initialize hardware modules
  sensor.begin();
  display.begin();
  battery.begin();
  display.showSplash();
  delay(1500); // Show splash for 1.5 seconds

  // 3. Initialize offline queue (RAM-based in Phase 5A)
  queue.begin();

  // 4. Initialize and start Wi-Fi connection
  wifiManager.begin();
  wifiManager.connect();
  display.showConnecting();

  Logger::info("SYSTEM", "Setup complete — entering main loop");
}

// ─────────────────────────────────────────────────────────────────────────────
// loop() — Arduino main loop, runs continuously
// ─────────────────────────────────────────────────────────────────────────────
void loop() {
  uint32_t now = millis();

  // ── 1. Drive Wi-Fi state machine (non-blocking) ───────────────────────────
  wifiManager.loop();

  bool isConnected = wifiManager.isConnected();

  // ── 2. Detect reconnection event ─────────────────────────────────────────
  // When transitioning from disconnected → connected, perform:
  // - Device authentication
  // - Time resync
  // - Offline queue flush
  if (isConnected && !wasConnected) {
    Logger::info("SYSTEM", "Wi-Fi (re)connected — running post-connect sequence");
    onReconnect();
  }
  wasConnected = isConnected;

  // ── 3. Take UV reading on interval ───────────────────────────────────────
  if (now - lastReadingTime >= READING_INTERVAL_MS) {
    lastReadingTime = now;
    takeAndProcessReading(isConnected);
  }

  // ── 4. Send heartbeat on interval ────────────────────────────────────────
  if (isConnected && (now - lastHeartbeatTime >= HEARTBEAT_INTERVAL_MS)) {
    lastHeartbeatTime = now;
    sendHeartbeat();
  }

  // ── 5. Periodic time resync ───────────────────────────────────────────────
  if (isConnected && (now - lastTimeSyncTime >= TIME_SYNC_INTERVAL_MS)) {
    lastTimeSyncTime = now;
    Logger::info("TIME", "Periodic time resync");
    timeSync.sync(BACKEND_BASE_URL);
  }

  // ── 6. Update display ─────────────────────────────────────────────────────
  // Refresh the display every 2 seconds with the current connection state.
  // This prevents the OFFLINE screen from overwriting ONLINE between readings,
  // while keeping display updates efficient (not every loop cycle).
  if (now - lastDisplayTime >= 2000) {
    lastDisplayTime = now;
    if (!isConnected) {
      display.showOffline(sensor.getLastUVIndex(), queue.size());
    } else {
      display.showReading(sensor.getLastUVIndex(), sensor.getLastVoltage(),
                          true, queue.size());
    }
  }

  // ── ESP8266 watchdog yield ─────────────────────────────────────────────────
  yield();
}

// ─────────────────────────────────────────────────────────────────────────────
// onReconnect() — Called once when Wi-Fi transitions to connected
// ─────────────────────────────────────────────────────────────────────────────
void onReconnect() {
  // Step 1: Sync time FIRST — independent of backend health.
  // Time is critical for reading timestamps. If backend is unreachable,
  // NTP fallback will still provide accurate time via internet.
  // This prevents readings from being stuck at epoch 1970.
  if (!timeSync.isSynced()) {
    lastTimeSyncTime = millis();
    timeSync.sync(BACKEND_BASE_URL);
  }

  // Step 2: Check backend health
  bool backendOk = apiClient.checkHealth();
  if (!backendOk) {
    Logger::warn("SYSTEM", "Backend health check failed — will retry on next cycle");
    return;
  }

  // Step 3: Authenticate device (if not already done this session)
  if (!deviceAuthenticated) {
    ApiResult authResult = apiClient.authenticate();
    deviceAuthenticated = authResult.success;
    if (!authResult.success) {
      Logger::error("SYSTEM", "Device authentication failed: " + authResult.message);
      Logger::error("SYSTEM", "Check DEVICE_ID and DEVICE_API_KEY in firmware_config.h");
      return;
    }
    Logger::info("SYSTEM", "Device authenticated successfully");
  }

  // Step 4: Re-sync time from backend (now that backend is confirmed reachable)
  lastTimeSyncTime = millis();
  timeSync.sync(BACKEND_BASE_URL);

  // Step 5: Flush offline queue
  if (!queue.isEmpty()) {
    flushOfflineQueue();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// takeAndProcessReading() — Reads sensor and either sends or queues the reading
// ─────────────────────────────────────────────────────────────────────────────
void takeAndProcessReading(bool isOnline) {
  // Build a Reading struct
  Reading r = createEmptyReading();
  r.rawAdc      = sensor.readRawADC();
  r.voltageV    = sensor.convertToVoltage(r.rawAdc);
  r.uvIndex     = sensor.convertToUVIndex(r.voltageV);
  r.uvIntensity = sensor.convertToUVIntensity(r.uvIndex);

  // Populate timestamp
  if (timeSync.isSynced()) {
    timeSync.getCurrentISO8601(r.recordedAt);
  } else {
    // No time sync — use a clearly invalid timestamp placeholder.
    // The backend will reject this; the reading is queued but will need
    // re-timestamping. Time sync should succeed before this happens in practice.
    snprintf(r.recordedAt, sizeof(r.recordedAt), "1970-01-01T00:00:00Z");
    Logger::warn("SENSOR", "Time not synced — reading timestamp is epoch (invalid)");
  }

  Logger::info("SENSOR",
    "Reading | UVI: " + String(r.uvIndex, 1) +
    " | ts: " + String(r.recordedAt) +
    " | online: " + String(isOnline));

  // Update display with latest reading
  display.showReading(r.uvIndex, r.voltageV, isOnline, queue.size());

  if (isOnline && deviceAuthenticated) {
    // Try to send directly
    ApiResult res = apiClient.sendReadings(&r, 1);
    if (!res.success) {
      Logger::warn("API", "Direct send failed — enqueuing reading for later upload");
      queue.enqueue(r);
    }
  } else {
    // Offline — store in queue
    queue.enqueue(r);
    Logger::info("QUEUE",
      "Reading queued (offline) | queue size: " + String(queue.size()));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// flushOfflineQueue() — Uploads all queued readings in chronological batches
// ─────────────────────────────────────────────────────────────────────────────
void flushOfflineQueue() {
  int total = queue.size();
  Logger::info("QUEUE", "Starting queue flush | " + String(total) + " readings to upload");
  display.showUploading(total);

  while (!queue.isEmpty()) {
    Reading batch[QUEUE_BATCH_SIZE];
    int batchSize = queue.getBatch(batch, QUEUE_BATCH_SIZE);

    if (batchSize == 0) break;

    ApiResult res = apiClient.sendReadings(batch, batchSize);

    if (res.success) {
      // Only remove readings from queue after HTTP 200 acknowledgement
      queue.removeUploaded(batchSize);
      Logger::info("QUEUE",
        "Batch uploaded | sent: " + String(batchSize) +
        " | remaining: " + String(queue.size()));
    } else {
      // Backend error — stop flushing and retry on next reconnect
      Logger::error("QUEUE",
        "Batch upload failed (" + res.message + ") — stopping flush, will retry");
      break;
    }

    yield(); // Keep watchdog happy during potentially long flush
    delay(200); // Brief pause between batches to avoid overwhelming backend
  }

  if (queue.isEmpty()) {
    Logger::info("QUEUE", "Queue fully flushed");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// sendHeartbeat() — Sends device health metrics to backend
// ─────────────────────────────────────────────────────────────────────────────
void sendHeartbeat() {
  int battPct           = battery.readPercentage();
  bool isCharging       = false;          // HARDWARE PENDING: TP4056 CHRG pin read
  int rssi              = wifiManager.getRSSI();
  unsigned long uptime  = (millis() - bootTime) / 1000UL;
  String sensorHealth   = "OK";           // HARDWARE PENDING: Real sensor health check

  Logger::info("SYSTEM",
    "Heartbeat | batt: " + String(battPct) +
    "% | rssi: " + String(rssi) + " dBm" +
    " | uptime: " + String(uptime) + "s");

  // Note: sendHeartbeat() gracefully handles 404 (backend endpoint pending)
  apiClient.sendHeartbeat(battPct, isCharging, rssi, uptime, sensorHealth);
}
