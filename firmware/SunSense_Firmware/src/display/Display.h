/**
 * =============================================================================
 * File: Display.h
 * Project: SunSense Firmware
 * Layer: Display Abstraction
 *
 * Purpose:
 * Hardware abstraction for the 1.3-inch I2C OLED display (SSD1306/SH1106).
 * Provides simple, targeted display methods for the SunSense UI.
 *
 * Physical Hardware Status: NOT YET CONNECTED (Phase 5A)
 * All display methods are stubbed and log to Serial only.
 * No physical rendering has been validated.
 *
 * Display Content (per client specification):
 * The device display should remain simple and show only:
 *   - UV Intensity (in mW/cm²)
 *   - UV Index
 *   - Wi-Fi status indicator
 *   - Battery level indicator
 *
 * Required Arduino Library (install via Library Manager):
 *   - Adafruit SSD1306 by Adafruit
 *   - Adafruit GFX Library by Adafruit
 *   OR for SH1106:
 *   - ESP8266 and ESP32 OLED driver for SSD1306 displays by ThingPulse
 *
 * Library selection will be finalized during hardware integration when
 * the exact OLED controller (SSD1306 vs SH1106) is confirmed.
 * =============================================================================
 */

#ifndef DISPLAY_H
#define DISPLAY_H

#include <Arduino.h>
#include "../config/firmware_config.h"
#include "../utils/Logger.h"

class Display {
public:
  /**
   * Initializes the I2C OLED display.
   * Call once in setup() after Wire.begin().
   *
   * HARDWARE PENDING: Requires physical OLED connected to SDA/SCL.
   */
  void begin();

  /**
   * Clears the display buffer and commits to screen.
   *
   * HARDWARE PENDING: No physical rendering until display is connected.
   */
  void clear();

  /**
   * Shows the startup splash screen with the SunSense logo/name.
   * Displayed briefly on boot before switching to the main reading screen.
   *
   * HARDWARE PENDING: Visual output not yet verified.
   */
  void showSplash();

  /**
   * Shows the main UV reading screen.
   * This is the primary display state during normal operation.
   *
   * Layout (128x64 pixels):
   *   Line 1: "UV Index: X.X"       (large text)
   *   Line 2: "Intensity: X.XXX mW" (small text)
   *   Line 3: Wi-Fi and battery icons (bottom row)
   *
   * @param uvIndex     Current UV Index to display (e.g., 7.4)
   * @param uvIntensity UV intensity in mW/cm² (e.g., 0.185)
   * @param wifiOk      true = Wi-Fi connected, false = disconnected
   * @param battPct     Battery percentage (0–100), -1 if unknown
   *
   * HARDWARE PENDING: Layout and font size confirmed during hardware phase.
   */
  void showReading(float uvIndex, float uvIntensity, bool wifiOk, int battPct);

  /**
   * Shows a "Connecting to Wi-Fi..." status screen.
   * Displayed during the initial Wi-Fi connection attempt.
   *
   * HARDWARE PENDING: Not yet physically tested.
   */
  void showConnecting();

  /**
   * Shows an "Offline — Queuing" status screen.
   * Displayed when Wi-Fi is lost and readings are being stored locally.
   *
   * @param queueSize Number of readings currently in the offline queue.
   *
   * HARDWARE PENDING: Not yet physically tested.
   */
  void showOffline(int queueSize);

  /**
   * Shows an "Uploading X readings..." screen during queue flush.
   * Displayed briefly while the offline queue is being uploaded.
   *
   * @param count Number of readings being uploaded.
   *
   * HARDWARE PENDING: Not yet physically tested.
   */
  void showUploading(int count);

  /**
   * Shows a general status/error message on screen.
   * Used for brief informational overlays.
   *
   * @param msg Short message string (max ~20 chars for 128px width)
   *
   * HARDWARE PENDING: Not yet physically tested.
   */
  void showStatus(const String& msg);

private:
  bool _initialized = false; // Tracks whether begin() completed successfully
};

#endif // DISPLAY_H
