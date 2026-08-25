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
  // A0 is shared with ML8511 — final pin assignment pending hardware decision.
  // No pinMode() needed for analog input on ESP8266/Arduino A0.
  Logger::info("BATTERY", "Battery monitor initialized — HARDWARE PENDING (no circuit connected)");
}

int Battery::readRawADC() {
  // HARDWARE PENDING: Reads A0 only when ML8511 EN is LOW (sensor disabled).
  // The ML8511 must be powered off before reading battery voltage to
  // avoid cross-contamination on the shared A0 pin.
  //
  // When hardware is available, the sequence will be:
  //   ml8511.disable();
  //   delay(5);  // Allow A0 to settle
  //   int raw = analogRead(BATTERY_ADC_PIN);
  //   return raw;

  Logger::debug("BATTERY", "readRawADC() called — HARDWARE PENDING (returning 0)");
  return 0; // Stub — returns 0 until hardware connected
}

float Battery::convertToVoltage(int rawAdc) {
  // HARDWARE PENDING: The actual ADC-to-voltage formula depends on the
  // voltage divider resistor values wired to the TP4056 VBAT pin.
  // NodeMCU A0 input range is 0–3.3V (with built-in divider from 0–1V input).
  //
  // For a Li-Ion battery (3.0V–4.2V), an external divider is required
  // to scale the voltage into the 0–3.3V ADC range.
  //
  // Example with 100kΩ + 47kΩ divider (scale factor = 1 + 100/47 ≈ 3.13):
  //   adcVoltage = (rawAdc / 1023.0) * 3.3
  //   battVoltage = adcVoltage * scaleFactor
  //
  // Scale factor = HARDWARE PENDING. Using 1.0 as neutral placeholder.
  float adcVoltage = (rawAdc / 1023.0f) * 3.3f;
  float scaleFactor = 1.0f; // HARDWARE PENDING — replace with measured divider ratio
  _lastVoltage = adcVoltage * scaleFactor;
  return _lastVoltage;
}

int Battery::convertToPercentage(float voltage) {
  // HARDWARE PENDING: Linear approximation — NOT accurate for Li-Ion.
  // Replace with discharge curve lookup table during hardware validation.

  if (voltage <= 0.0f) return -1; // Hardware unavailable

  float pct = ((voltage - BATTERY_MIN_VOLTAGE) /
               (BATTERY_MAX_VOLTAGE - BATTERY_MIN_VOLTAGE)) * 100.0f;

  // Clamp to 0–100%
  if (pct < 0.0f)   pct = 0.0f;
  if (pct > 100.0f) pct = 100.0f;

  return (int)pct;
}

int Battery::readPercentage() {
  int   raw     = readRawADC();
  float voltage = convertToVoltage(raw);
  int   pct     = convertToPercentage(voltage);

  Logger::info("BATTERY",
    "Battery | Raw:" + String(raw) +
    " | V:" + String(voltage, 2) +
    " | Pct:" + String(pct) + "% [HARDWARE PENDING]");

  return pct;
}

float Battery::getLastVoltage() const {
  return _lastVoltage;
}
