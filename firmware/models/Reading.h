/**
 * =============================================================================
 * File: Reading.h
 * Project: SunSense Firmware
 * Layer: Model
 *
 * Purpose:
 * Defines the Reading struct — the core data unit produced by the firmware.
 * One Reading is generated each READING_INTERVAL_MS by the main loop.
 *
 * Backend Contract (Source: docs/backend/06_Request_Response_Models.md):
 * The backend /api/v1/readings endpoint expects:
 *   {
 *     "readings": [
 *       { "uvIndex": 6.5, "recordedAt": "2026-08-03T12:00:00Z" }
 *     ]
 *   }
 *
 * The firmware Reading struct maps to this exactly:
 *   - uvIndex     → Calculated UV Index (float, 0.0–30.0)
 *   - recordedAt  → ISO 8601 UTC timestamp string (from TimeSync)
 *
 * Additional diagnostic fields (rawAdc, voltageV, uvIntensity) are stored
 * in RAM for logging and debugging but are NOT sent to the backend.
 * The backend payload contains only { uvIndex, recordedAt }.
 * =============================================================================
 */

#ifndef READING_H
#define READING_H

#include <Arduino.h>

/**
 * A single UV sensor reading produced by the firmware.
 *
 * Fields sent to backend via POST /api/v1/readings:
 *   - uvIndex     : Calculated UV Index value (0.0–30.0)
 *   - recordedAt  : ISO 8601 UTC timestamp string (e.g., "2026-08-03T12:00:00Z")
 *
 * Diagnostic fields (local only — not sent to backend):
 *   - rawAdc      : Raw 10-bit ADC reading from A0 (0–1023)
 *   - voltageV    : Converted sensor voltage in Volts (0.0–3.3V)
 *   - uvIntensity : Computed UV intensity in mW/cm² (hardware-pending formula)
 *
 * NOTE:
 * Physical ML8511 calibration is hardware-pending.
 * uvIndex and uvIntensity may be 0.0 until hardware is connected and calibrated.
 */
struct Reading {
  // ── Backend payload fields ──────────────────────────────────────────────────
  float   uvIndex;          // UV Index calculated from sensor data (0.0–30.0)
  char    recordedAt[25];   // ISO 8601 UTC timestamp: "YYYY-MM-DDTHH:MM:SSZ\0"

  // ── Diagnostic / local-only fields (not sent to backend) ────────────────────
  int     rawAdc;           // Raw ADC value from ML8511 OUT pin (0–1023)
  float   voltageV;         // Sensor voltage converted from rawAdc (0.0–3.3V)
  float   uvIntensity;      // UV intensity in mW/cm² — HARDWARE PENDING

  // ── Queue metadata ───────────────────────────────────────────────────────────
  bool    uploaded;         // True after successfully acknowledged by backend
};

/**
 * Returns an empty Reading with safe default values.
 * Used to initialize Reading structs before population.
 */
inline Reading createEmptyReading() {
  Reading r;
  r.uvIndex     = 0.0f;
  r.recordedAt[0] = '\0';
  r.rawAdc      = 0;
  r.voltageV    = 0.0f;
  r.uvIntensity = 0.0f;
  r.uploaded    = false;
  return r;
}

#endif // READING_H
