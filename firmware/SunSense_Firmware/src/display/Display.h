/**
 * =============================================================================
 * File: Display.h
 * Project: SunSense Firmware
 * Layer: Display Abstraction
 *
 * Purpose:
 * Hardware abstraction for the 1.3-inch I2C OLED display (SH1106).
 * Provides simple, targeted display methods for the SunSense UI.
 *
 * Required Arduino Library (install via Library Manager):
 *   - Adafruit SH110X by Adafruit
 *   - Adafruit GFX Library by Adafruit
 * =============================================================================
 */

#ifndef DISPLAY_H
#define DISPLAY_H

#include <Arduino.h>
#include "../config/firmware_config.h"
#include "../utils/Logger.h"

class Display {
public:
  void begin();
  void clear();
  void showSplash();
  
  // Renders the main dashboard: UVI, Risk, Voltage, Online Status, and Queue Size
  void showReading(float uvIndex, float voltage, bool isOnline, int queueCount);
  
  void showConnecting();
  void showOffline(float uvIndex, int queueCount);
  void showUploading(int count);
  void showError(const String& msg);

private:
  bool _initialized = false;
  
  void oledClear();
  void oledText(const String& text, int x, int y, int size);
  String getUVRisk(float uvi);
};

#endif // DISPLAY_H
