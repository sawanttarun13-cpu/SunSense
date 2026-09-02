/**
 * =============================================================================
 * File: ApiClient.h
 * Project: SunSense Firmware
 * Layer: API Communication
 *
 * Purpose:
 * HTTP client for communicating with the SunSense backend REST API.
 * Implements all device-facing endpoints exactly as documented in:
 *   docs/backend/05_REST_API.md
 *   docs/backend/06_Request_Response_Models.md
 *
 * Authentication:
 * All device-facing endpoints require two headers:
 *   x-device-id : <UUID assigned at device registration>
 *   x-api-key   : <64-char hex secret from device registration>
 *
 * These are read from firmware_config.h (DEVICE_ID, DEVICE_API_KEY).
 *
 * SECURITY:
 * - DEVICE_ID is safe to log.
 * - DEVICE_API_KEY MUST NEVER be printed to Serial.
 *
 * Backend Integration Status:
 * ┌─────────────────────────────────────┬──────────────┬──────────────────────┐
 * │ Endpoint                            │ Implemented? │ Notes                │
 * ├─────────────────────────────────────┼──────────────┼──────────────────────┤
 * │ POST /api/v1/readings               │ ✅ Yes        │ Fully live           │
 * │ POST /api/v1/device/authenticate    │ ✅ Yes        │ Fully live           │
 * │ GET  /api/v1/health                 │ ✅ Yes        │ Fully live           │
 * │ GET  /api/v1/server/time            │ ❌ Pending    │ Backend gap Phase 5A │
 * │ POST /api/v1/device/heartbeat       │ ❌ Pending    │ Backend gap Phase 5A │
 * └─────────────────────────────────────┴──────────────┴──────────────────────┘
 * =============================================================================
 */

#ifndef API_CLIENT_H
#define API_CLIENT_H

#include <Arduino.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include "../config/firmware_config.h"
#include "../models/Reading.h"
#include "../utils/Logger.h"

/** Result of an API call */
struct ApiResult {
  bool    success;     // true = HTTP 2xx received
  int     httpCode;    // Raw HTTP status code
  String  message;     // Summary message or error description
  int     inserted;    // For /readings: number of readings accepted
  int     duplicates;  // For /readings: number of duplicate readings skipped
};

class ApiClient {
public:
  /**
   * Constructor.
   * @param baseUrl Backend base URL from firmware_config.h (BACKEND_BASE_URL)
   */
  explicit ApiClient(const String& baseUrl);

  /**
   * POST /api/v1/readings
   *
   * Sends a batch of UV readings to the backend.
   * Each reading in the array must have uvIndex and recordedAt populated.
   *
   * Request body format (from docs/backend/06_Request_Response_Models.md):
   * {
   *   "readings": [
   *     { "uvIndex": 6.5, "recordedAt": "2026-08-03T12:00:00Z" },
   *     ...
   *   ]
   * }
   *
   * Headers: x-device-id, x-api-key
   *
   * @param readings Array of Reading structs to send
   * @param count    Number of readings in the array
   * @return ApiResult with success, httpCode, inserted, duplicates
   */
  ApiResult sendReadings(const Reading* readings, int count);

  /**
   * POST /api/v1/device/heartbeat
   *
   * Sends device health metrics to the backend.
   *
   * REQUEST BODY (from docs/backend/06_Request_Response_Models.md):
   * {
   *   "batteryPercentage": 85,
   *   "chargingState": false,
   *   "wifiRssi": -65,
   *   "firmwareVersion": "1.0.0",
   *   "deviceUptimeSeconds": 86400,
   *   "sensorHealth": "OK"
   * }
   *
   * BACKEND STATUS: Implementation pending.
   * This endpoint is defined in the API documentation but not yet
   * implemented in the backend routes. Will return HTTP 404 until resolved.
   * The firmware handles 404 gracefully and logs a warning.
   *
   * @param batteryPct         Battery percentage (0–100, or -1 if unknown)
   * @param isCharging         true if TP4056 is in charging state
   * @param rssi               Wi-Fi RSSI in dBm
   * @param uptimeSeconds      Device uptime in seconds since last boot
   * @param sensorHealth       "OK" or "ERROR" based on last sensor read
   * @return ApiResult
   */
  ApiResult sendHeartbeat(int batteryPct, bool isCharging, int rssi,
                          unsigned long uptimeSeconds, const String& sensorHealth);

  /**
   * POST /api/v1/device/authenticate
   *
   * Verifies device credentials with the backend.
   * Used during startup to confirm the device is correctly registered.
   *
   * Headers: x-device-id, x-api-key
   *
   * Response: { "message": "Device authenticated", "deviceId": "<uuid>" }
   *
   * @return ApiResult
   */
  ApiResult authenticate();

  /**
   * GET /api/v1/health
   *
   * Checks backend server and database health.
   * Used to confirm the backend is reachable before attempting data uploads.
   *
   * Response: { "server": "running", "database": "connected", ... }
   *
   * @return true if backend is healthy (HTTP 200)
   */
  bool checkHealth();

private:
  String    _baseUrl;
  WiFiClientSecure _wifiClient;

  /**
   * Adds the required device authentication headers to an HTTPClient.
   * SECURITY: API key is sent in header but NEVER logged.
   * @param http HTTPClient instance to add headers to
   */
  void _addAuthHeaders(HTTPClient& http);

  /**
   * Adds Content-Type: application/json header.
   * @param http HTTPClient instance
   */
  void _addJsonHeader(HTTPClient& http);

  /** Builds and returns the full URL for an endpoint path. */
  String _buildUrl(const char* endpoint) const;
};

#endif // API_CLIENT_H
