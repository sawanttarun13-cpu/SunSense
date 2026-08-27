#include "GUVAS12SD.h"

GUVAS12SD::GUVAS12SD(int outPin)
  : _outPin(outPin),
    _lastRawADC(0),
    _lastVoltage(0.0f),
    _lastUVIndex(0.0f),
    _lastUVIntensity(0.0f) {}

void GUVAS12SD::begin() {
  // A0 does not need pinMode on ESP8266
  Logger::info("SENSOR", "GUVA-S12SD initialized on A0 — PROVISIONAL calibration");
}

int GUVAS12SD::readRawADC() {
  uint32_t sum = 0;
  for (int i = 0; i < ADC_SAMPLES; i++) {
    sum += analogRead(_outPin);
    delay(3);
    yield();
  }
  _lastRawADC = (int)(sum / ADC_SAMPLES);
  return _lastRawADC;
}

float GUVAS12SD::convertToVoltage(int rawAdc) {
  // ESP8266 NodeMCU A0 ADC-to-Voltage conversion:
  //
  // The NodeMCU board has a built-in voltage divider (220kΩ + 100kΩ) on A0
  // that maps an external 0–3.3V input to the ESP8266's internal 0–1.0V ADC range.
  //
  // analogRead() returns 0–1023 for the 0–3.3V external input range.
  //
  // Formula: Voltage = (rawAdc / 1023.0) × 3.3
  //
  // This gives us the voltage at the S12SD SIG/OUT pin directly.
  //
  // VERIFIED: This formula is correct for NodeMCU boards with the onboard divider.
  _lastVoltage = (rawAdc / GUVAS12SD_ADC_RESOLUTION) * GUVAS12SD_ADC_REF_V;
  return _lastVoltage;
}

float GUVAS12SD::convertToUVIndex(float voltage) {
  // -------------------------------------------------------------------------
  // GUVA-S12SD approximate conversion
  //
  // 0.1 V ≈ 1 UV Index
  //
  // Therefore:
  //
  // UVI = voltage / 0.1
  // -------------------------------------------------------------------------
  if (voltage <= 0.0f) {
    _lastUVIndex = 0.0f;
    return 0.0f;
  }

  // Detect impossible/suspicious sensor output.
  if (voltage > GUVAS12SD_MAX_OUTPUT_V) {
    Logger::warn(
      "SENSOR",
      "[S12SD] Output above expected range: " + String(voltage, 3) +
      " V | ADC=" + String(_lastRawADC)
    );
    // Do NOT convert impossible voltage directly into UVI.
    //
    // Instead treat the sensor as saturated at its expected maximum.
    voltage = GUVAS12SD_MAX_OUTPUT_V;
  }

  float uvIndex = voltage / GUVAS12SD_VOLTS_PER_UVI;

  if (uvIndex < 0.0f) uvIndex = 0.0f;
  if (uvIndex > GUVAS12SD_MAX_UVI) uvIndex = GUVAS12SD_MAX_UVI;

  _lastUVIndex = uvIndex;
  return uvIndex;
}

float GUVAS12SD::convertToUVIntensity(float uvIndex) {
  // Standard WHO approximation: 1 UV Index ≈ 0.025 mW/cm²
  // This is a rough back-calculation for display purposes only.
  // STATUS: PROVISIONAL — for diagnostic display, not scientific measurement.
  float intensity = uvIndex * 0.025f;
  _lastUVIntensity = intensity;
  return intensity;
}

float GUVAS12SD::readUVIndex() {
  // Full sensor read cycle: ADC → Voltage → UV Index → Intensity
  int   raw       = readRawADC();
  float voltage   = convertToVoltage(raw);
  float uvIndex   = convertToUVIndex(voltage);
  float intensity = convertToUVIntensity(uvIndex);

  // ── S12SD Phase 5B Diagnostic Output ────────────────────────────────────
  // This block produces a clearly identifiable diagnostic log for each
  // reading cycle. Used during physical hardware validation.
  Logger::info("S12SD",
    "Raw ADC: " + String(raw) +
    " | Sensor Voltage: " + String(voltage, 3) + " V" +
    " | UV Index: " + String(uvIndex, 2) +
    " | UV Intensity: " + String(intensity, 3) + " mW/cm2");

  return uvIndex;
}

int GUVAS12SD::getLastRawADC() const {
  return _lastRawADC;
}

float GUVAS12SD::getLastVoltage() const {
  return _lastVoltage;
}

float GUVAS12SD::getLastUVIndex() const {
  return _lastUVIndex;
}

float GUVAS12SD::getLastUVIntensity() const {
  return _lastUVIntensity;
}

