/**
 * =============================================================================
 * File: Battery.cpp
 * Project: SunSense Firmware
 * Layer: Battery Abstraction
 *
 * Purpose:
 * Implementation of battery voltage monitoring.
 *
 * HARDWARE STATUS: NOT YET CONNECTED (Phase 5A)
 * All methods return stub values until hardware wiring is completed.
 * =============================================================================
 */

#include "Battery.h"

void Battery::begin() {
  // A0 is shared with S12SD — final pin assignment pending hardware decision.
  // No pinMode() needed for analog input on ESP8266/Arduino A0.
  Logger::info("BATTERY", "Battery monitor initialized — HARDWARE PENDING (no circuit connected)");
}

int Battery::readRawADC() {
  // Read analog value from A0. 
  // NOTE: A0 is shared with the UV sensor. If connected directly, values may conflict.
  int raw = analogRead(A0);
  Logger::debug("BATTERY", "readRawADC() called — returning " + String(raw));
  return raw;
}

float Battery::convertToVoltage(int rawAdc) {
  // NodeMCU A0 input range is 0–3.3V (with built-in divider from 0–1V input).
  //
  // Example with 100kΩ + 47kΩ divider (scale factor = 1 + 100/47 ≈ 3.13):
  //   adcVoltage = (rawAdc / 1023.0) * 3.3
  //   battVoltage = adcVoltage * scaleFactor
  //
  float adcVoltage = (rawAdc / 1023.0f) * 3.3f;
  
  // Using 1.3 as a reasonable scale factor placeholder for a typical voltage divider for 4.2V Li-Ion,
  // bringing 4.2V down to ~3.2V (which fits in the 3.3V NodeMCU range).
  float scaleFactor = 1.3f; 
  _lastVoltage = adcVoltage * scaleFactor;
  return _lastVoltage;
}

int Battery::convertToPercentage(float voltage) {
  // Linear approximation for 3.0V - 4.2V Li-Ion battery
  if (voltage <= 1.0f) return 0; // If disconnected or very low reading

  float pct = ((voltage - BATTERY_MIN_VOLTAGE) /
               (BATTERY_MAX_VOLTAGE - BATTERY_MIN_VOLTAGE)) * 100.0f;

  // Clamp to 0–100%
  if (pct < 0.0f)   pct = 0.0f;
  if (pct > 100.0f) pct = 100.0f;

  return (int)pct;
}

int Battery::readPercentage() {
  // MOCKED DATA (Option A selected by user)
  // Hardcoded to 85% because A0 is occupied by the UV sensor,
  // and the battery voltage cannot be physically measured without an external ADC.
  int pct = 85;

  Logger::info("BATTERY", "Battery | Pct:" + String(pct) + "% [MOCKED]");

  return pct;
}

float Battery::getLastVoltage() const {
  return _lastVoltage;
}
