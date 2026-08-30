/**
 * =============================================================================
 * File: OTAManager.h
 * Project: SunSense Firmware
 * Layer: Network
 *
 * Purpose:
 * Safely handles checking and downloading OTA firmware updates using the
 * native ESP8266httpUpdate library.
 * =============================================================================
 */

#ifndef OTA_MANAGER_H
#define OTA_MANAGER_H

#include <Arduino.h>

class OTAManager {
public:
  OTAManager();
  
  /**
   * Checks the backend for a firmware update and installs it if available.
   * Uses x-ESP8266-version header automatically via ESPhttpUpdate.
   * 
   * @param baseUrl Backend base URL
   * @param deviceId Device UUID
   * @param apiKey Device API Key
   * @param currentVersion Current firmware version string
   * @return true if update was checked (even if no update available), false on failure
   */
  bool checkAndUpdate(const String& baseUrl, const String& deviceId, const String& apiKey, const String& currentVersion);
};

#endif // OTA_MANAGER_H
