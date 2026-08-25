/**
 * =============================================================================
 * File: ML8511.h
 * Project: SunSense Firmware
 * Layer: Sensor Abstraction
 *
 * Purpose:
 * Hardware abstraction layer for the ML8511 UV sensor.
 * Provides a clean interface for reading UV data from the sensor.
 *
 * Physical Hardware Status: NOT YET CONNECTED (Phase 5A)
 * All method implementations return placeholder/stub values until
 * physical hardware is connected and calibrated.
 *
 * ML8511 Sensor Overview:
 *   - Detects UV light in the 280–390 nm range (UVA + UVB)
 *   - Output: analog voltage proportional to UV intensity
 *   - EN pin: HIGH = sensor active, LOW = sensor powered down (power saving)
 *   - Supply voltage: 3.3V (compatible with ESP8266)
 *
 * Calibration Status: HARDWARE PENDING
 * The exact voltage-to-UV-intensity formula for this specific module
 * has NOT been validated. The conversion formula below references the
 * ML8511 application note but MUST be calibrated against a known UV source
 * during the hardware integration phase.
 *
 * References:
 *   - ML8511 Datasheet: https://www.lapis-semi.com/en/prd/sensor/ml8511
 *   - Application Note: ML8511 Output Voltage vs UV Intensity table
 * =============================================================================
 */

#ifndef ML8511_H
#define ML8511_H

#include <Arduino.h>
#include "../../config/firmware_config.h"
#include "../../utils/Logger.h"

class ML8511 {
public:
  /**
   * Constructor.
   * @param enPin  Arduino/ESP8266 digital pin connected to ML8511 EN.
   * @param outPin Arduino/ESP8266 analog pin connected to ML8511 OUT.
   */
  ML8511(int enPin, int outPin);

  /**
   * Initializes GPIO pin modes for the ML8511.
   * Sets EN pin as OUTPUT and begins with the sensor disabled.
   * Call once in setup().
   *
   * HARDWARE PENDING: Physical pin validation not yet performed.
   */
  void begin();

  /**
   * Reads the raw 10-bit ADC value from the sensor output pin.
   * Enables the sensor, takes multiple samples for stability,
   * then disables the sensor to save power.
   *
   * @return Raw ADC value (0–1023)
   *
   * HARDWARE PENDING: Returns 0 until physical sensor is connected.
   */
  int readRawADC();

  /**
   * Converts the raw ADC reading to sensor output voltage.
   * Assumes 3.3V ADC reference voltage and 10-bit resolution.
   *
   * Formula: voltage = (rawAdc / 1023.0) * 3.3
   *
   * @param rawAdc Raw ADC value from readRawADC()
   * @return Sensor voltage in Volts (0.0–3.3V)
   *
   * NOTE: This formula is standard ADC conversion. It does not
   * require hardware calibration and is implemented as-is.
   */
  float convertToVoltage(int rawAdc);

  /**
   * Converts sensor voltage to estimated UV intensity (mW/cm²).
   *
   * CALIBRATION STATUS: HARDWARE PENDING
   *
   * The formula below is derived from the ML8511 application note.
   * It has NOT been validated against a calibrated UV reference source.
   * The conversion coefficients MUST be verified during hardware testing.
   *
   * Approximate formula from ML8511 app note:
   *   uvIntensity = (voltage - V_ZERO) / SENSITIVITY
   *   Where: V_ZERO ≈ 1.0V (output at 0 mW/cm²)
   *          SENSITIVITY ≈ 0.129 V per mW/cm²
   *
   * These values are approximate and MUST be replaced with
   * measured calibration values from the actual hardware.
   *
   * @param voltage Sensor voltage from convertToVoltage()
   * @return Approximate UV intensity in mW/cm² (HARDWARE PENDING)
   */
  float convertToUVIntensity(float voltage);

  /**
   * Converts UV intensity (mW/cm²) to UV Index.
   *
   * CALIBRATION STATUS: HARDWARE PENDING
   *
   * Formula: UV Index = uvIntensity / 0.025
   * This is a widely cited approximation: 1 UV Index ≈ 25 mW/m² ≈ 0.025 mW/cm²
   *
   * This formula MUST be validated against a calibrated reference
   * during hardware testing, as sensor-specific correction factors may apply.
   *
   * @param uvIntensity UV intensity in mW/cm²
   * @return Estimated UV Index (0.0–20.0+)
   */
  float convertToUVIndex(float uvIntensity);

  /**
   * Performs a full sensor read cycle and returns the estimated UV Index.
   * This is the primary method called by the main firmware loop.
   *
   * Steps:
   * 1. readRawADC()
   * 2. convertToVoltage()
   * 3. convertToUVIntensity()
   * 4. convertToUVIndex()
   *
   * @return Estimated UV Index (HARDWARE PENDING — returns 0.0 until calibrated)
   */
  float readUVIndex();

  /**
   * Returns the last raw ADC value from the most recent readRawADC() call.
   * Useful for diagnostics and calibration logging.
   */
  int getLastRawADC() const;

  /**
   * Returns the last voltage from the most recent convertToVoltage() call.
   */
  float getLastVoltage() const;

  /**
   * Returns the last UV intensity from the most recent convertToUVIntensity() call.
   */
  float getLastUVIntensity() const;

  /** Enables the ML8511 sensor by pulling EN pin HIGH. */
  void enable();

  /** Disables the ML8511 sensor by pulling EN pin LOW (power saving). */
  void disable();

private:
  int   _enPin;            // EN digital output pin
  int   _outPin;           // OUT analog input pin
  int   _lastRawADC;       // Cached last raw ADC value
  float _lastVoltage;      // Cached last voltage reading
  float _lastUVIntensity;  // Cached last UV intensity

  // ── Calibration Constants ─────────────────────────────────────────────────
  //
  // HARDWARE PENDING: These values are from the ML8511 application note.
  // They MUST be validated and replaced with measured values during hardware
  // integration. Do NOT use these for any medically significant UV exposure
  // calculations until physical calibration is complete.
  //
  static constexpr float UV_ZERO_VOLTAGE  = 1.0f;    // Output voltage at 0 mW/cm² — UNVALIDATED
  static constexpr float UV_SENSITIVITY   = 0.129f;  // V per mW/cm² — UNVALIDATED
  static constexpr float UV_INDEX_DIVISOR = 0.025f;  // mW/cm² per UV Index unit — APPROXIMATE

  static const int ADC_SAMPLES = 5; // Number of ADC samples averaged per read
};

#endif // ML8511_H
