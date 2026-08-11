/**
 * =============================================================================
 * File: TimeSync.h
 * Project: SunSense Firmware
 * Layer: Time Management
 *
 * Purpose:
 * Manages time synchronization for the ESP8266.
 *
 * Strategy:
 * The primary time source is the SunSense backend server endpoint:
 *   GET /api/v1/server/time
 *
 * This endpoint is documented in the backend architecture but is NOT yet
 * implemented in the current backend codebase.
 * STATUS: Backend implementation pending — Phase 5A integration gap.
 *
 * When the server-time endpoint is available:
 *   ONLINE: Sync with backend. Set internal epoch offset.
 *   OFFLINE: Use millis()-based local time continuation.
 *   RECONNECT: Re-sync with server to correct any drift.
 *
 * Why not NTP exclusively?
 * NTP requires internet access. The SunSense device may connect to a local
 * development Wi-Fi network without internet access (e.g., a hotspot sharing
 * a local dev machine running the backend). Using the SunSense backend as
 * the time source ensures time sync works in all development environments.
 *
 * Fallback NTP (secondary):
 * If the backend server-time endpoint is not available AND the device has
 * internet access, NTP will be attempted as a fallback.
 * =============================================================================
 */

#ifndef TIME_SYNC_H
#define TIME_SYNC_H

#include <Arduino.h>
#include "../config/firmware_config.h"
#include "../utils/Logger.h"

class TimeSync {
public:
  /**
   * Initializes the time sync module.
   * Does NOT sync time immediately — call sync() after Wi-Fi connects.
   */
  void begin();

  /**
   * Attempts to synchronize time with the backend server.
   *
   * Primary source: GET /api/v1/server/time
   * STATUS: Backend endpoint implementation pending.
   *        Will return HTTP 404 until backend implements this endpoint.
   *        The method handles 404 gracefully and falls back to NTP.
   *
   * Fallback: NTP pool (requires internet access)
   *
   * @param serverBaseUrl The backend base URL from firmware_config.h
   * @return true if sync succeeded (from either source), false if both failed
   */
  bool sync(const String& serverBaseUrl);

  /**
   * Returns the current time as an ISO 8601 UTC string.
   * Format: "YYYY-MM-DDTHH:MM:SSZ"
   *
   * Uses the internal epoch + millis() offset to compute current time.
   * If time has never been synced, returns "1970-01-01T00:00:00Z" (epoch).
   *
   * @param buffer Output buffer for the timestamp string (must be >= 25 bytes)
   */
  void getCurrentISO8601(char* buffer);

  /**
   * Returns the current Unix epoch timestamp (seconds since 1970-01-01T00:00:00Z).
   * Returns 0 if time has never been synced.
   */
  unsigned long getCurrentEpoch() const;

  /**
   * Returns true if time has been successfully synchronized at least once.
   */
  bool isSynced() const;

  /**
   * Returns how many seconds ago the last sync occurred.
   * Returns 0 if never synced.
   */
  unsigned long secondsSinceSync() const;

private:
  unsigned long _epochAtSync   = 0;  // Unix timestamp received from server or NTP at last sync
  unsigned long _millisAtSync  = 0;  // millis() value at the moment of last sync
  bool          _synced        = false;

  /** Attempts to sync from the backend server-time endpoint. */
  bool _syncFromServer(const String& serverBaseUrl);

  /** Attempts NTP sync as fallback when backend endpoint is unavailable. */
  bool _syncFromNTP();

  /** Sets internal epoch state after a successful sync. */
  void _setEpoch(unsigned long epoch);
};

#endif // TIME_SYNC_H
