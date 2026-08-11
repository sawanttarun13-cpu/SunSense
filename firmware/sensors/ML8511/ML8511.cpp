/**
 * =============================================================================
 * File: ML8511.cpp
 * Project: SunSense Firmware
 * Layer: Sensor Abstraction
 *
 * Purpose:
 * Implementation of the ML8511 UV sensor abstraction.
 *
 * HARDWARE STATUS: NOT YET CONNECTED (Phase 5A)
 * Methods that read from hardware return 0.0 or stub values.
 * All calibration constants are marked HARDWARE PENDING.
 *
 * Physical validation, ADC calibration, and formula verification
 * will be completed during the hardware integration phase.
 * =============================================================================
 */

#include "ML8511.h"

ML8511::ML8511(int enPin, int outPin)
  : _enPin(enPin),
    _outPin(outPin),
    _lastRawADC(0),
    _lastVoltage(0.0f),
    _lastUVIntensity(0.0f) {}

void ML8511::begin() {
  pinMode(_enPin, OUTPUT);
  disable(); // Start with sensor powered off to save energy
  Logger::info("SENSOR", "ML8511 initialized — HARDWARE PENDING (no physical sensor connected)");
}

void ML8511::enable() {
  digitalWrite(_enPin, HIGH);
  delay(1); // Brief stabilization delay after enabling
}

void ML8511::disable() {
  digitalWrite(_enPin, LOW);
}

int ML8511::readRawADC() {
  // HARDWARE PENDING: When hardware is connected, enable sensor, average
  // multiple ADC samples, then disable for power saving.
  //
  // The averaging loop below is structurally correct but will read 0
  // on A0 until the ML8511 is physically wired.

  enable();
  delay(10); // Allow sensor output to stabilize after enable

  long sum = 0;
  for (int i = 0; i < ADC_SAMPLES; i++) {
    sum += analogRead(_outPin);
    delay(2); // Short delay between samples for ADC stability
  }

  disable();

  _lastRawADC = (int)(sum / ADC_SAMPLES);

  Logger::debug("SENSOR", "Raw ADC: " + String(_lastRawADC) +
    " (HARDWARE PENDING — value is 0 without physical sensor)");

  return _lastRawADC;
}

float ML8511::convertToVoltage(int rawAdc) {
  // Standard 10-bit ADC to voltage conversion.
  // 3.3V reference, 10-bit resolution (0–1023).
  // This formula is NOT hardware-dependent for calibration purposes.
  _lastVoltage = (rawAdc / 1023.0f) * 3.3f;
  return _lastVoltage;
}

float ML8511::convertToUVIntensity(float voltage) {
  // HARDWARE PENDING: Formula from ML8511 application note.
  // UV_ZERO_VOLTAGE and UV_SENSITIVITY are UNVALIDATED constants.
  // These MUST be measured and corrected against a calibrated UV source
  // during the hardware integration phase.

  float intensity = (voltage - UV_ZERO_VOLTAGE) / UV_SENSITIVITY;

  // Clamp to 0 — sensor output below zero-voltage threshold means no UV detected
  if (intensity < 0.0f) intensity = 0.0f;

  _lastUVIntensity = intensity;
  return _lastUVIntensity;
}

float ML8511::convertToUVIndex(float uvIntensity) {
  // HARDWARE PENDING: UV Index formula is an approximation.
  // 1 UV Index unit ≈ 25 mW/m² = 0.025 mW/cm²
  // Must be validated against WHO UV Index scale during hardware testing.
  float uvIndex = uvIntensity / UV_INDEX_DIVISOR;

  // Clamp to reasonable range. WHO UV Index goes 0–11+, extreme is 11+.
  // We allow up to 30 as the backend validator accepts up to 30.
  if (uvIndex < 0.0f)  uvIndex = 0.0f;
  if (uvIndex > 30.0f) uvIndex = 30.0f;

  return uvIndex;
}

float ML8511::readUVIndex() {
  // Full sensor read cycle: ADC → voltage → intensity → UV Index
  int   raw       = readRawADC();
  float voltage   = convertToVoltage(raw);
  float intensity = convertToUVIntensity(voltage);
  float uvIndex   = convertToUVIndex(intensity);

  Logger::info("SENSOR",
    "UV read | ADC: " + String(raw) +
    " | V: " + String(voltage, 2) +
    " | I: " + String(intensity, 3) + " mW/cm2" +
    " | UVI: " + String(uvIndex, 1) +
    " [HARDWARE PENDING]");

  return uvIndex;
}

int ML8511::getLastRawADC() const {
  return _lastRawADC;
}

float ML8511::getLastVoltage() const {
  return _lastVoltage;
}

float ML8511::getLastUVIntensity() const {
  return _lastUVIntensity;
}
