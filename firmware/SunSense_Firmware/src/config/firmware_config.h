/**
 * =============================================================================
 * File: firmware_config.h
 * Project: SunSense Firmware
 * Layer: Configuration
 *
 * Purpose:
 * Central configuration header for the SunSense ESP8266 firmware.
 * All runtime-configurable values are defined here as constants or
 * preprocessor macros so they are easy to find and change.
 *
 * SECURITY NOTICE:
 * This file MUST NOT contain real Wi-Fi passwords, real Device IDs,
 * or real API keys. All secrets below are placeholder values only.
 * Real credentials are flashed onto the device during physical
 * deployment and are NEVER committed to the repository.
 *
 * How to configure before flashing:
 * 1. Copy this file.
 * 2. Replace PLACEHOLDER values with real credentials.
 * 3. Flash the firmware to the device.
 * 4. Do NOT commit the modified file.
 * =============================================================================
 */

#ifndef FIRMWARE_CONFIG_H
#define FIRMWARE_CONFIG_H

// -----------------------------------------------------------------------------
// Firmware Version
// Update this string whenever new firmware is compiled and flashed.
// Sent in heartbeat payloads so the backend knows which firmware is running.
// -----------------------------------------------------------------------------
#define FIRMWARE_VERSION "1.0.0-phase5a"

// -----------------------------------------------------------------------------
// Backend API Configuration
//
// BASE_URL: The SunSense backend API base URL.
//   - Development : "http://192.168.1.X:5000"  (local IP of dev machine)
//   - Production  : "https://api.sunsense.io"  (not yet deployed)
//
// NOTE: The ESP8266 cannot resolve 'localhost' — use the machine's LAN IP
// when connecting to a locally running backend during development.
// -----------------------------------------------------------------------------
#define BACKEND_BASE_URL     "http://10.111.164.104:5000"   // Automatically updated with local IP
#define API_PREFIX           "/api/v1"

// Assembled endpoint paths — constructed from BACKEND_BASE_URL + API_PREFIX
#define ENDPOINT_READINGS    "/api/v1/readings"
#define ENDPOINT_HEARTBEAT   "/api/v1/device/heartbeat"    // Backend implementation pending (Phase 5A gap)
#define ENDPOINT_SERVER_TIME "/api/v1/server/time"         // Backend implementation pending (Phase 5A gap)
#define ENDPOINT_AUTH_CHECK  "/api/v1/device/authenticate"
#define ENDPOINT_HEALTH      "/api/v1/health"

// -----------------------------------------------------------------------------
// Device Authentication Credentials
//
// These are obtained by calling POST /api/v1/device/register from the
// SunSense React frontend after logging in with the user's account.
// The returned Device ID and API Key must be pasted below before flashing.
//
// SECURITY:
// - DEVICE_ID is a UUID (non-secret, identifies the device).
// - DEVICE_API_KEY is a 64-char hex secret. DO NOT print to Serial.
//   DO NOT commit the real value to Git.
// -----------------------------------------------------------------------------
#define DEVICE_ID       "cdea2948-f7c9-42ea-ab14-f050b4907849"
#define DEVICE_API_KEY "cf917a342b54c44420eeb40181f056607a2b3dec7b2bc3d34c6a92b2e4f5652f"
// -----------------------------------------------------------------------------
// Wi-Fi Configuration
//
// SECURITY: DO NOT commit real credentials.
// The firmware uses WPA2 personal (PSK) mode.
// The Wi-Fi manager will attempt reconnection automatically.
// -----------------------------------------------------------------------------
#define WIFI_SSID     "OnePlus Nord CE 3 Lite 5G 1c15"       
#define WIFI_PASSWORD "244466666"   
// Wi-Fi connection parameters
#define WIFI_CONNECT_TIMEOUT_MS  15000   // Maximum time to wait for initial connection (15 seconds)
#define WIFI_RECONNECT_DELAY_MS   5000   // Delay between reconnection attempts (5 seconds)
#define WIFI_MAX_RETRIES             5   // Maximum reconnection attempts before giving up for one cycle

// -----------------------------------------------------------------------------
// Timing Configuration
// All values are in milliseconds unless otherwise stated.
// -----------------------------------------------------------------------------

// How often the S12SD sensor is read and a Reading is generated.
#define READING_INTERVAL_MS       60000   // 1 minute between readings (matches backend session logic)

// How often the device sends the heartbeat payload to the backend.
// The heartbeat keeps the device ONLINE status alive on the dashboard.
// Backend marks device OFFLINE if lastPing > 5 minutes old.
#define HEARTBEAT_INTERVAL_MS    120000   // 2 minutes between heartbeats

// How often the firmware checks for an offline queue to upload.
// This triggers after Wi-Fi reconnects — not on a fixed schedule.
#define QUEUE_FLUSH_INTERVAL_MS   30000   // 30 seconds after reconnection before flushing

// How often the firmware syncs time with the backend server.
// Server time is used for accurate timestamps on readings.
#define TIME_SYNC_INTERVAL_MS  3600000   // Re-sync once per hour

// -----------------------------------------------------------------------------
// Offline Queue Configuration
// The in-memory queue stores readings while the device is offline.
// These are uploaded in chronological order upon Wi-Fi reconnection.
// NOTE: SPIFFS/LittleFS persistent storage is hardware-pending.
// -----------------------------------------------------------------------------
#define QUEUE_MAX_SIZE          200   // Maximum readings stored in RAM when offline
#define QUEUE_BATCH_SIZE         50   // Readings sent per HTTP POST to /api/v1/readings

// -----------------------------------------------------------------------------
// Hardware Pin Configuration (ESP8266 NodeMCU)
//
// These pin assignments are FOR REFERENCE ONLY.
// Physical wiring has NOT been validated in Phase 5A.
// Pin assignments will be confirmed during hardware integration.
// -----------------------------------------------------------------------------

// GUVA-S12SD UV Sensor
// The GUVA-S12SD generally does not have an enable pin, it is always on.
// SIG/OUT pin carries the analog voltage proportional to UV Index.
#define GUVAS12SD_OUT_PIN       A0   // Analog: UV voltage output (0–3.3V)

// ── PROVISIONAL S12SD Calibration Constants ─────────────────────────────────
// STATUS: PROVISIONAL — Requires physical verification during Phase 5B testing.
//
// These values are derived from the GUVA-S12SD datasheet (typical values).
// Actual sensor behavior may differ due to manufacturing variance, operating
// temperature, and the specific voltage divider on the NodeMCU A0 input.
//
// DO NOT treat these as production-calibrated values.
// Final calibration must be performed against a reference UV meter.
//
// GUVA-S12SD Datasheet Reference (typical):
//   Output voltage is approximately linear with UV Index.
//   ~0.1V per 1 UV Index (range: 0V at UVI=0, ~1.0V at UVI=10)
//   Maximum output voltage: ~1.17V (sensor physical limit)
// ─────────────────────────────────────────────────────────────────────────────
#define GUVAS12SD_VOLTS_PER_UVI   0.1f   // PROVISIONAL — volts per UV Index unit
#define GUVAS12SD_MAX_OUTPUT_V    1.2f   // PROVISIONAL — S12SD max output voltage (datasheet ~1.17V, rounded up)
#define GUVAS12SD_ADC_REF_V       3.3f   // NodeMCU A0 full-scale voltage (built-in voltage divider maps 0-3.3V to 10-bit ADC)
#define GUVAS12SD_ADC_RESOLUTION  1023.0f // ESP8266 10-bit ADC max value

// NOTE: ESP8266 has only ONE analog input (A0).
// Battery voltage measurement must share this pin via a multiplexer,
// or battery will be estimated from a separate digital/analog source.
// This will be resolved during hardware integration.

// I2C OLED Display (SSD1306 or SH1106, 1.3-inch, 128x64)
#define OLED_SDA_PIN    D2   // I2C Data
#define OLED_SCL_PIN    D1   // I2C Clock
#define OLED_I2C_ADDR 0x3C   // Standard SSD1306/SH1106 I2C address (try 0x3D if 0x3C fails)
#define OLED_WIDTH      128
#define OLED_HEIGHT      64

// TP4056 Battery Monitoring
// HARDWARE PENDING: Exact ADC divider circuit values unknown until hardware test.
// These are structural placeholders only.
#define BATTERY_ADC_PIN       A0   // Same as S12SD — requires hardware multiplexing (no EN pin)
#define BATTERY_MAX_VOLTAGE  4.20  // Full charge (Li-Ion) — HARDWARE PENDING VALIDATION
#define BATTERY_MIN_VOLTAGE  3.00  // Cutoff voltage — HARDWARE PENDING VALIDATION

// -----------------------------------------------------------------------------
// Serial Debug Configuration
// Set to 1 to enable verbose Serial output during development.
// Set to 0 before a production flash to disable all Serial output.
// NEVER print API keys or passwords regardless of this setting.
// -----------------------------------------------------------------------------
#define DEBUG_ENABLED  1
#define SERIAL_BAUD    115200

#endif // FIRMWARE_CONFIG_H
