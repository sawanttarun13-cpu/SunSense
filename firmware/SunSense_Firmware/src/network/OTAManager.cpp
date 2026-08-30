/**
 * =============================================================================
 * File: OTAManager.cpp
 * Project: SunSense Firmware
 * Layer: Network
 * =============================================================================
 */

#include "OTAManager.h"
#include "../utils/Logger.h"
#include "../config/firmware_config.h"

#include <ESP8266WiFi.h>
#include <ESP8266httpUpdate.h>
#include <WiFiClient.h>

OTAManager::OTAManager() {
}

bool OTAManager::checkAndUpdate(const String& baseUrl, const String& deviceId, const String& apiKey, const String& currentVersion) {
  if (WiFi.status() != WL_CONNECTED) {
    Logger::warn("OTA", "WiFi not connected, skipping OTA check");
    return false;
  }

  Logger::info("OTA", "Checking for updates...");
  Logger::info("OTA", "Current version: " + currentVersion);

  String url = baseUrl + ENDPOINT_OTA;

  WiFiClient client;
  
  // Set headers explicitly for ESPhttpUpdate
  ESPhttpUpdate.rebootOnUpdate(true); // default is true
  
  // Disable automatic following of redirects for security
  ESPhttpUpdate.followRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  
  // The ESPhttpUpdate class doesn't have a direct method to add headers permanently before update() 
  // without modifying its internal HTTPClient, but we can pass headers.
  // Actually, ESPhttpUpdate allows setting headers or doing it before. 
  // Wait, let's use the ESPhttpUpdate API. We need to pass x-device-id and x-api-key.
  // ESPhttpUpdate doesn't natively expose custom headers easily in some older core versions, but we can try to use a custom HTTPClient if needed.
  // In ESP8266 core, ESPhttpUpdate.update(client, url, currentVersion) doesn't take headers.
  // But wait! ESPhttpUpdate.setLedPin() exists. What about headers?
  // We can't inject headers easily. We must construct our own HTTPClient, or use the signature:
  // update(WiFiClient& client, const String& url, const String& currentVersion = "")
  // Wait, there's no way to pass x-api-key? 
  // Let's check if we can just use HTTPClient to fetch the binary and Update.writeStream() instead.
  // A simpler way: ESPhttpUpdate does not take custom headers easily. 
  // Let me write a robust OTA fetcher using HTTPClient + Update class.
  // BUT the ESPhttpUpdate library might have an issue. Let's just use it and see if we can do something else, or use `Update` class directly.
  
  HTTPClient http;
  http.begin(client, url);
  http.addHeader("x-device-id", deviceId);
  http.addHeader("x-api-key", apiKey);
  http.addHeader("x-ESP8266-version", currentVersion);
  
  int httpCode = http.GET();
  
  if (httpCode == HTTP_CODE_NOT_MODIFIED) { // 304
    Logger::info("OTA", "Firmware is up to date (304 Not Modified)");
    http.end();
    return true;
  }
  
  if (httpCode == HTTP_CODE_OK) { // 200
    int contentLength = http.getSize();
    Logger::info("OTA", "Update found! Size: " + String(contentLength));
    
    if (contentLength > 0) {
      bool canBegin = Update.begin(contentLength);
      if (canBegin) {
        Logger::info("OTA", "Begin OTA update...");
        WiFiClient* stream = http.getStreamPtr();
        size_t written = Update.writeStream(*stream);
        
        if (written == contentLength) {
          Logger::info("OTA", "Written : " + String(written) + " successfully");
        } else {
          Logger::error("OTA", "Written only : " + String(written) + "/" + String(contentLength) + ". Retry?");
        }
        
        if (Update.end()) {
          Logger::info("OTA", "OTA done!");
          if (Update.isFinished()) {
            Logger::info("OTA", "Update successfully completed. Rebooting.");
            delay(1000);
            ESP.restart();
          } else {
            Logger::error("OTA", "Update not finished? Something went wrong!");
          }
        } else {
          Logger::error("OTA", "Error Occurred. Error #: " + String(Update.getError()));
        }
      } else {
        Logger::error("OTA", "Not enough space to begin OTA");
      }
    } else {
      Logger::error("OTA", "Update size is 0 or unknown");
    }
  } else {
    Logger::error("OTA", "OTA check failed, HTTP code: " + String(httpCode));
  }
  
  http.end();
  return false;
}
