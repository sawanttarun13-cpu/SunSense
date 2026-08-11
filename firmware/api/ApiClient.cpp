/**
 * =============================================================================
 * File: ApiClient.cpp
 * Project: SunSense Firmware
 * Layer: API Communication
 *
 * Purpose:
 * Implementation of all SunSense backend API communication.
 *
 * SECURITY:
 * - DEVICE_API_KEY is added to request headers but NEVER printed to Serial.
 * - DEVICE_ID is logged (non-secret identifier).
 *
 * Backend Integration Status (Phase 5A):
 * - POST /api/v1/readings           : LIVE — fully integrated
 * - POST /api/v1/device/authenticate: LIVE — fully integrated
 * - GET  /api/v1/health             : LIVE — fully integrated
 * - GET  /api/v1/server/time        : PENDING — handled gracefully (404)
 * - POST /api/v1/device/heartbeat   : PENDING — handled gracefully (404)
 * =============================================================================
 */

#include "ApiClient.h"
#include <ArduinoJson.h>

ApiClient::ApiClient(const String& baseUrl) : _baseUrl(baseUrl) {}

String ApiClient::_buildUrl(const char* endpoint) const {
  return _baseUrl + String(endpoint);
}

void ApiClient::_addAuthHeaders(HTTPClient& http) {
  // DEVICE_ID is a UUID — safe to include in logs and headers.
  // DEVICE_API_KEY is the plaintext secret — added to header but NEVER logged.
  http.addHeader("x-device-id", DEVICE_ID);
  http.addHeader("x-api-key",   DEVICE_API_KEY);  // SECRET — NEVER log this value
}

void ApiClient::_addJsonHeader(HTTPClient& http) {
  http.addHeader("Content-Type", "application/json");
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/readings
// ─────────────────────────────────────────────────────────────────────────────
ApiResult ApiClient::sendReadings(const Reading* readings, int count) {
  ApiResult result = {false, 0, "", 0, 0};

  if (count == 0) {
    result.message = "No readings to send";
    return result;
  }

  String url = _buildUrl(ENDPOINT_READINGS);
  Logger::info("API", "POST " + url + " | count: " + String(count));

  // Build JSON payload:
  // { "readings": [{ "uvIndex": 6.5, "recordedAt": "2026-08-03T12:00:00Z" }, ...] }
  //
  // Using ArduinoJson DynamicJsonDocument sized for QUEUE_BATCH_SIZE readings.
  // Each reading object: ~60 bytes. Add 128 bytes overhead.
  DynamicJsonDocument doc(count * 80 + 128);
  JsonArray arr = doc.createNestedArray("readings");

  for (int i = 0; i < count; i++) {
    JsonObject obj = arr.createNestedObject();
    obj["uvIndex"]    = serialized(String(readings[i].uvIndex, 2));
    obj["recordedAt"] = readings[i].recordedAt;
  }

  String payload;
  serializeJson(doc, payload);

  HTTPClient http;
  http.begin(_wifiClient, url);
  http.setTimeout(10000); // 10-second timeout for batch uploads
  _addAuthHeaders(http);
  _addJsonHeader(http);

  result.httpCode = http.POST(payload);

  if (result.httpCode == 200) {
    String responseStr = http.getString();
    StaticJsonDocument<256> resp;
    DeserializationError err = deserializeJson(resp, responseStr);

    if (!err) {
      result.inserted    = resp["inserted"]   | 0;
      result.duplicates  = resp["duplicates"] | 0;
      result.message     = "OK";
      result.success     = true;
      Logger::info("API", "Readings accepted | inserted: " + String(result.inserted) +
        " | duplicates: " + String(result.duplicates));
    } else {
      result.success = true; // HTTP 200 still counts as success
      result.message = "OK (response parse failed)";
    }
  } else {
    result.message = "HTTP " + String(result.httpCode);
    Logger::error("API", "sendReadings failed — " + result.message);
  }

  http.end();
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/device/heartbeat
//
// Backend status: IMPLEMENTATION PENDING (Phase 5A integration gap).
// This endpoint is documented but not yet implemented in backend routes.
// Returns HTTP 404 until the backend adds this endpoint.
// ─────────────────────────────────────────────────────────────────────────────
ApiResult ApiClient::sendHeartbeat(int batteryPct, bool isCharging, int rssi,
                                   unsigned long uptimeSeconds, const String& sensorHealth) {
  ApiResult result = {false, 0, "", 0, 0};

  String url = _buildUrl(ENDPOINT_HEARTBEAT);
  Logger::info("API", "POST " + url + " [Backend implementation pending]");

  // Build heartbeat payload per documented contract:
  // {
  //   "batteryPercentage": 85,
  //   "chargingState": false,
  //   "wifiRssi": -65,
  //   "firmwareVersion": "1.0.0",
  //   "deviceUptimeSeconds": 86400,
  //   "sensorHealth": "OK"
  // }
  StaticJsonDocument<256> doc;
  doc["batteryPercentage"]  = batteryPct;
  doc["chargingState"]      = isCharging;
  doc["wifiRssi"]           = rssi;
  doc["firmwareVersion"]    = FIRMWARE_VERSION;
  doc["deviceUptimeSeconds"] = uptimeSeconds;
  doc["sensorHealth"]       = sensorHealth;

  String payload;
  serializeJson(doc, payload);

  HTTPClient http;
  http.begin(_wifiClient, url);
  http.setTimeout(5000);
  _addAuthHeaders(http);
  _addJsonHeader(http);

  result.httpCode = http.POST(payload);
  http.end();

  if (result.httpCode == 200) {
    result.success = true;
    result.message = "Heartbeat accepted";
    Logger::info("API", "Heartbeat OK");
  } else if (result.httpCode == 404) {
    // Expected in Phase 5A — backend endpoint not yet implemented
    result.success = false;
    result.message = "Heartbeat endpoint not yet implemented on backend (404)";
    Logger::warn("API", "POST /api/v1/device/heartbeat → 404 (Backend implementation pending)");
  } else {
    result.success = false;
    result.message = "HTTP " + String(result.httpCode);
    Logger::error("API", "Heartbeat failed — " + result.message);
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/device/authenticate
// ─────────────────────────────────────────────────────────────────────────────
ApiResult ApiClient::authenticate() {
  ApiResult result = {false, 0, "", 0, 0};

  String url = _buildUrl(ENDPOINT_AUTH_CHECK);
  Logger::info("API", "POST " + url + " | device: " + String(DEVICE_ID));

  HTTPClient http;
  http.begin(_wifiClient, url);
  http.setTimeout(5000);
  _addAuthHeaders(http);
  _addJsonHeader(http);

  // POST with empty body — authentication is via headers
  result.httpCode = http.POST("{}");

  if (result.httpCode == 200) {
    result.success = true;
    result.message = "Device authenticated";
    Logger::info("API", "Device authentication successful");
  } else if (result.httpCode == 401) {
    result.success = false;
    result.message = "Authentication failed — check DEVICE_ID and DEVICE_API_KEY in firmware_config.h";
    Logger::error("API", "Authentication failed (401) — credentials may be incorrect or device not registered");
  } else {
    result.success = false;
    result.message = "HTTP " + String(result.httpCode);
    Logger::error("API", "authenticate() failed — " + result.message);
  }

  http.end();
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/health
// ─────────────────────────────────────────────────────────────────────────────
bool ApiClient::checkHealth() {
  String url = _buildUrl(ENDPOINT_HEALTH);
  Logger::debug("API", "GET " + url);

  HTTPClient http;
  http.begin(_wifiClient, url);
  http.setTimeout(5000);

  int code = http.GET();
  bool healthy = (code == 200);

  if (healthy) {
    Logger::info("API", "Backend health check: OK (200)");
  } else {
    Logger::warn("API", "Backend health check: FAIL (HTTP " + String(code) + ")");
  }

  http.end();
  return healthy;
}
