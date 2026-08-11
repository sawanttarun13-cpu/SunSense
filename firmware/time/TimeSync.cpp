/**
 * =============================================================================
 * File: TimeSync.cpp
 * Project: SunSense Firmware
 * Layer: Time Management
 *
 * Purpose:
 * Implementation of time synchronization.
 * Tries backend server first, falls back to NTP if backend is unavailable.
 *
 * Backend endpoint: GET /api/v1/server/time
 * STATUS: Backend implementation pending.
 *         HTTP 404 is handled gracefully — NTP fallback is used.
 *
 * Expected server response (from docs/backend/06_Request_Response_Models.md):
 *   { "utcTime": "2026-08-03T12:05:00Z", "unixTimestamp": 1785758700 }
 * =============================================================================
 */

#include "TimeSync.h"
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>

// NTP fallback configuration
static const char* NTP_SERVER_1  = "pool.ntp.org";
static const char* NTP_SERVER_2  = "time.nist.gov";
static const int   NTP_GMT_OFFSET = 0;   // UTC — we always work in UTC
static const int   NTP_DST_OFFSET = 0;   // No DST adjustment

void TimeSync::begin() {
  Logger::info("TIME", "TimeSync initialized — awaiting first sync");
}

bool TimeSync::sync(const String& serverBaseUrl) {
  Logger::info("TIME", "Attempting time sync...");

  // Try backend server-time endpoint first
  if (_syncFromServer(serverBaseUrl)) {
    Logger::info("TIME", "Synced from backend server — epoch: " + String(_epochAtSync));
    return true;
  }

  // Fall back to NTP
  Logger::warn("TIME", "Backend time endpoint unavailable — trying NTP fallback");
  if (_syncFromNTP()) {
    Logger::info("TIME", "Synced from NTP — epoch: " + String(_epochAtSync));
    return true;
  }

  Logger::error("TIME", "All time sync sources failed — readings will use unsynchronized time");
  return false;
}

bool TimeSync::_syncFromServer(const String& serverBaseUrl) {
  // ── Backend endpoint status ───────────────────────────────────────────────
  // GET /api/v1/server/time
  // STATUS: Backend implementation pending (Phase 5A integration gap).
  //         This endpoint is defined in docs/backend/05_REST_API.md and
  //         docs/backend/06_Request_Response_Models.md but is NOT yet
  //         implemented in the backend routes.
  //
  //         Expected response:
  //         { "utcTime": "2026-08-03T12:05:00Z", "unixTimestamp": 1785758700 }
  //
  //         This method will receive HTTP 404 until the backend endpoint is
  //         implemented. It handles 404 gracefully and returns false so
  //         the NTP fallback is used.
  // ──────────────────────────────────────────────────────────────────────────

  if (WiFi.status() != WL_CONNECTED) {
    Logger::warn("TIME", "Not connected — cannot sync from server");
    return false;
  }

  WiFiClient client;
  HTTPClient http;

  String url = serverBaseUrl + ENDPOINT_SERVER_TIME;
  Logger::debug("TIME", "GET " + url);

  http.begin(client, url);
  http.setTimeout(5000); // 5-second timeout
  int httpCode = http.GET();

  if (httpCode == 404) {
    // Backend endpoint not yet implemented — this is expected in Phase 5A
    Logger::warn("TIME", "GET /api/v1/server/time → 404 (Backend implementation pending)");
    http.end();
    return false;
  }

  if (httpCode != 200) {
    Logger::warn("TIME", "GET /api/v1/server/time → HTTP " + String(httpCode));
    http.end();
    return false;
  }

  // Parse the JSON response
  // Expected: { "utcTime": "...", "unixTimestamp": 1785758700 }
  String payload = http.getString();
  http.end();

  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, payload);
  if (err) {
    Logger::error("TIME", "Failed to parse server-time JSON: " + String(err.c_str()));
    return false;
  }

  if (!doc.containsKey("unixTimestamp")) {
    Logger::error("TIME", "server-time response missing 'unixTimestamp' field");
    return false;
  }

  unsigned long epoch = doc["unixTimestamp"].as<unsigned long>();
  _setEpoch(epoch);
  return true;
}

bool TimeSync::_syncFromNTP() {
  // NTP sync using ESP8266 built-in configTime()
  configTime(NTP_GMT_OFFSET, NTP_DST_OFFSET, NTP_SERVER_1, NTP_SERVER_2);

  Logger::debug("TIME", "Waiting for NTP...");

  // Wait up to 10 seconds for NTP to respond
  uint32_t start = millis();
  while (time(nullptr) < 1000000000UL) {
    if (millis() - start > 10000) {
      Logger::warn("TIME", "NTP sync timed out");
      return false;
    }
    delay(100);
    yield(); // Keep ESP8266 watchdog happy
  }

  unsigned long epoch = (unsigned long)time(nullptr);
  _setEpoch(epoch);
  return true;
}

void TimeSync::_setEpoch(unsigned long epoch) {
  _epochAtSync  = epoch;
  _millisAtSync = millis();
  _synced       = true;
}

void TimeSync::getCurrentISO8601(char* buffer) {
  unsigned long epoch = getCurrentEpoch();

  // Convert Unix epoch to broken-down time components
  unsigned long t = epoch;
  int secs   = t % 60; t /= 60;
  int mins   = t % 60; t /= 60;
  int hours  = t % 24; t /= 24;

  // Simplified date calculation (does not account for leap years pre-2026 drift)
  // Acceptable precision for Phase 5A. Full RTC or time.h usage recommended for production.
  long days  = t;
  int year   = 1970;
  while (true) {
    int daysInYear = ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) ? 366 : 365;
    if (days < daysInYear) break;
    days -= daysInYear;
    year++;
  }
  static const int daysInMonth[] = {31,28,31,30,31,30,31,31,30,31,30,31};
  int month = 0;
  bool isLeap = ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0);
  for (month = 0; month < 12; month++) {
    int dim = daysInMonth[month];
    if (month == 1 && isLeap) dim = 29;
    if (days < dim) break;
    days -= dim;
  }
  int day = days + 1;
  month++;

  snprintf(buffer, 25, "%04d-%02d-%02dT%02d:%02d:%02dZ",
    year, month, day, hours, mins, secs);
}

unsigned long TimeSync::getCurrentEpoch() const {
  if (!_synced) return 0;
  // Apply elapsed millis() since last sync to update the epoch
  unsigned long elapsedSec = (millis() - _millisAtSync) / 1000UL;
  return _epochAtSync + elapsedSec;
}

bool TimeSync::isSynced() const {
  return _synced;
}

unsigned long TimeSync::secondsSinceSync() const {
  if (!_synced) return 0;
  return (millis() - _millisAtSync) / 1000UL;
}
