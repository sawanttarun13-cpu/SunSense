/**
 * =============================================================================
 * File: Logger.cpp
 * Project: SunSense Firmware
 * Layer: Utilities
 *
 * Purpose:
 * Implementation of the categorized Serial logger.
 * Formats all output as: [LEVEL][CATEGORY] message
 *
 * Example output:
 *   [INFO][WIFI] Connecting to network...
 *   [WARN][API]  HTTP 404 — server-time endpoint not yet implemented on backend
 *   [ERROR][API] Failed to send readings — HTTP 500
 *   [DEBUG][SENSOR] Raw ADC: 512 | Voltage: 1.65V
 *
 * Security: This file MUST NOT print credentials. See Logger.h for full rules.
 * =============================================================================
 */

#include "Logger.h"

void Logger::begin() {
  Serial.begin(SERIAL_BAUD);
  delay(100); // Allow Serial to stabilize on ESP8266
  Serial.println(F(""));
  Serial.println(F("============================================================="));
  Serial.println(F("  SunSense Firmware — Serial Logger Initialized"));
  Serial.print(F("  Version: "));
  Serial.println(F(FIRMWARE_VERSION));
  Serial.println(F("============================================================="));
}

void Logger::info(const char* category, const String& message) {
#if DEBUG_ENABLED
  Serial.print(F("[INFO]["));
  Serial.print(category);
  Serial.print(F("] "));
  Serial.println(message);
#endif
}

void Logger::warn(const char* category, const String& message) {
#if DEBUG_ENABLED
  Serial.print(F("[WARN]["));
  Serial.print(category);
  Serial.print(F("] "));
  Serial.println(message);
#endif
}

void Logger::error(const char* category, const String& message) {
  // Errors are always printed regardless of DEBUG_ENABLED
  Serial.print(F("[ERROR]["));
  Serial.print(category);
  Serial.print(F("] "));
  Serial.println(message);
}

void Logger::debug(const char* category, const String& message) {
#if DEBUG_ENABLED
  Serial.print(F("[DEBUG]["));
  Serial.print(category);
  Serial.print(F("] "));
  Serial.println(message);
#endif
}
