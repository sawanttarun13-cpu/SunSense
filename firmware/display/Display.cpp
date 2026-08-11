/**
 * =============================================================================
 * File: Display.cpp
 * Project: SunSense Firmware
 * Layer: Display Abstraction
 *
 * Purpose:
 * Implementation of the OLED display abstraction.
 * In Phase 5A, all methods are stubbed — they log to Serial instead
 * of rendering to physical hardware.
 *
 * HARDWARE STATUS: NOT YET CONNECTED (Phase 5A)
 *
 * When physical hardware is connected during the hardware integration phase:
 * 1. Uncomment the Adafruit_SSD1306 or ThingPulse OLED library includes.
 * 2. Instantiate the display object with correct I2C address and dimensions.
 * 3. Replace the Serial stubs below with actual display.print() calls.
 * 4. Test the I2C address (0x3C or 0x3D) with an I2C scanner sketch.
 * =============================================================================
 */

#include "Display.h"

// ─── Library Include (HARDWARE PENDING) ────────────────────────────────────────
// Uncomment ONE of the following when hardware is available:
//
// Option A: SSD1306 (most common)
// #include <Adafruit_SSD1306.h>
// static Adafruit_SSD1306 oled(OLED_WIDTH, OLED_HEIGHT, &Wire, -1);
//
// Option B: SH1106 (alternative, common in 1.3-inch modules)
// #include <SH1106Wire.h>
// static SH1106Wire oled(OLED_I2C_ADDR, OLED_SDA_PIN, OLED_SCL_PIN);
//
// The correct choice depends on the OLED controller chip.
// Use an I2C scanner and check the chip markings during hardware integration.
// ─────────────────────────────────────────────────────────────────────────────

void Display::begin() {
  // HARDWARE PENDING: Replace with display.begin() call.
  // e.g.: if (!oled.begin(SSD1306_SWITCHCAPVCC, OLED_I2C_ADDR)) { ... }
  _initialized = false; // Set to true after successful hardware begin()
  Logger::info("DISPLAY", "Display::begin() called — HARDWARE PENDING (no physical display connected)");
}

void Display::clear() {
  if (!_initialized) return;
  // HARDWARE PENDING: oled.clearDisplay(); oled.display();
  Logger::debug("DISPLAY", "Display cleared");
}

void Display::showSplash() {
  if (!_initialized) {
    Logger::debug("DISPLAY", "[SPLASH] SunSense v" + String(FIRMWARE_VERSION));
    return;
  }
  // HARDWARE PENDING:
  // oled.clearDisplay();
  // oled.setTextSize(2);
  // oled.setCursor(0, 10);
  // oled.println("SunSense");
  // oled.setTextSize(1);
  // oled.println(FIRMWARE_VERSION);
  // oled.display();
}

void Display::showReading(float uvIndex, float uvIntensity, bool wifiOk, int battPct) {
  if (!_initialized) {
    Logger::info("DISPLAY",
      "[READING] UVI:" + String(uvIndex, 1) +
      " | I:" + String(uvIntensity, 3) +
      " mW | WiFi:" + String(wifiOk ? "OK" : "OFF") +
      " | Batt:" + String(battPct) + "%");
    return;
  }
  // HARDWARE PENDING: Full OLED rendering implementation.
  // Layout TBD during hardware integration based on physical screen test.
  //
  // oled.clearDisplay();
  // oled.setTextSize(2);
  // oled.setCursor(0, 0);
  // oled.print("UVI: "); oled.println(uvIndex, 1);
  // oled.setTextSize(1);
  // oled.print("Int: "); oled.print(uvIntensity, 3); oled.println(" mW");
  // oled.print(wifiOk ? "WiFi:OK" : "WiFi:--");
  // oled.print("  Batt:"); oled.print(battPct); oled.println("%");
  // oled.display();
}

void Display::showConnecting() {
  if (!_initialized) {
    Logger::info("DISPLAY", "[STATUS] Connecting to Wi-Fi...");
    return;
  }
  // HARDWARE PENDING: oled.clearDisplay(); oled.println("Connecting..."); oled.display();
}

void Display::showOffline(int queueSize) {
  if (!_initialized) {
    Logger::warn("DISPLAY", "[STATUS] Offline | Queue: " + String(queueSize) + " readings");
    return;
  }
  // HARDWARE PENDING: Show offline indicator + queue count on OLED.
}

void Display::showUploading(int count) {
  if (!_initialized) {
    Logger::info("DISPLAY", "[STATUS] Uploading " + String(count) + " readings...");
    return;
  }
  // HARDWARE PENDING: Show upload progress on OLED.
}

void Display::showStatus(const String& msg) {
  if (!_initialized) {
    Logger::info("DISPLAY", "[STATUS] " + msg);
    return;
  }
  // HARDWARE PENDING:
  // oled.clearDisplay();
  // oled.setCursor(0, 20);
  // oled.println(msg);
  // oled.display();
}
