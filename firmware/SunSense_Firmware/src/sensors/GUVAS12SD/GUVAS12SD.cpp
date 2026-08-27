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
  // Average multiple ADC samples to reduce noise.
  // The GUVA-S12SD doesn't have an EN pin — it is always outputting.
  long sum = 0;
  for (int i = 0; i < ADC_SAMPLES; i++) {
    sum += analogRead(_outPin);
    delay(2); // Short delay between samples for ADC stability
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
  // GUVA-S12SD UV Index Conversion (PROVISIONAL):
  //
  // Datasheet relationship (typical):
  //   UV Index ≈ Voltage / 0.1V
  //
  // At UV Index 1:  ~0.1V output
  // At UV Index 5:  ~0.5V output
  // At UV Index 10: ~1.0V output
  // Sensor max:     ~1.17V output (UV Index ~11.7)
  //
  // STATUS: PROVISIONAL — requires validation against a reference UV meter.
  float uvIndex = voltage / GUVAS12SD_VOLTS_PER_UVI;

  // ── Saturation / Anomaly Detection ──────────────────────────────────────
  // The GUVA-S12SD physically cannot output more than ~1.17V.
  // If voltage exceeds the datasheet maximum, something is wrong:
  //   - Sensor saturation (direct intense light on photodiode)
  //   - Wiring issue (A0 receiving voltage from another source)
  //   - Electrical noise or floating pin
  //   - Incorrect voltage divider assumptions
  //
  // We REPORT the condition instead of silently clamping.
  if (voltage > GUVAS12SD_MAX_OUTPUT_V) {
    Logger::warn("SENSOR",
      "[S12SD SATURATION] Voltage " + String(voltage, 3) +
      "V exceeds S12SD datasheet max (" + String(GUVAS12SD_MAX_OUTPUT_V, 1) +
      "V) — ADC: " + String(_lastRawADC) +
      " | Calculated UVI: " + String(uvIndex, 1) +
      " — Possible: sensor saturation / wiring issue / noise");
  }

  // Clamp negative values (ADC noise floor)
  if (uvIndex < 0.0f) uvIndex = 0.0f;

  // Safety clamp at 30 — this is NOT a calibration cap.
  // UV Index 30 is physically impossible on Earth's surface.
  // This prevents ArduinoJson overflow and display corruption only.
  if (uvIndex > 30.0f) uvIndex = 30.0f;

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

