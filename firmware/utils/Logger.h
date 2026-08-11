/**
 * =============================================================================
 * File: Logger.h
 * Project: SunSense Firmware
 * Layer: Utilities
 *
 * Purpose:
 * Simple categorized Serial logger for development and debugging.
 * All log output goes to Serial (Arduino Serial Monitor / serial terminal).
 *
 * Log Categories:
 *   [SYSTEM]   - Startup, boot, firmware lifecycle events
 *   [WIFI]     - Wi-Fi connection, disconnect, reconnect events
 *   [API]      - HTTP request/response events (no secrets printed)
 *   [TIME]     - Time synchronization events
 *   [QUEUE]    - Offline queue add/upload/flush events
 *   [SENSOR]   - ML8511 readings and ADC events
 *   [DISPLAY]  - OLED rendering events
 *   [BATTERY]  - Battery level readings
 *
 * Security:
 * The Logger MUST NEVER print:
 *   - Wi-Fi passwords
 *   - API keys
 *   - Device authentication credentials
 *   - JWT tokens
 * =============================================================================
 */

#ifndef LOGGER_H
#define LOGGER_H

#include <Arduino.h>
#include "../config/firmware_config.h"

class Logger {
public:
  /** Initializes Serial at SERIAL_BAUD. Call once in setup(). */
  static void begin();

  /** Prints an INFO-level message with the given category prefix. */
  static void info(const char* category, const String& message);

  /** Prints a WARN-level message with the given category prefix. */
  static void warn(const char* category, const String& message);

  /** Prints an ERROR-level message with the given category prefix. */
  static void error(const char* category, const String& message);

  /** Prints a DEBUG-level message. Only shown when DEBUG_ENABLED is 1. */
  static void debug(const char* category, const String& message);
};

#endif // LOGGER_H
