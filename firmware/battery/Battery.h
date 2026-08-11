/**
 * =============================================================================
 * File: Battery.h
 * Project: SunSense Firmware
 * Layer: Battery Abstraction
 *
 * Purpose:
 * Hardware abstraction for battery voltage monitoring via the TP4056 module.
 * Provides a future interface for reading battery voltage and percentage.
 *
 * Physical Hardware Status: NOT YET CONNECTED (Phase 5A)
 *
 * Hardware Design Note (for integration phase):
 * The ESP8266 has only ONE analog input (A0) with a 0–1.0V input range
 * (NodeMCU boards have a built-in 100k/220k voltage divider to 0–3.3V).
 * The ML8511 sensor also uses A0. To avoid conflict:
 *   Option A: Use a CD4051 analog multiplexer to time-share A0.
 *   Option B: Read battery via a separate digital voltage measurement circuit.
 *   Option C: Read battery only when ML8511 EN pin is LOW (sensor off).
 *
 * The sharing strategy will be decided and implemented during hardware integration.
 * The constants BATTERY_MAX_VOLTAGE and BATTERY_MIN_VOLTAGE in firmware_config.h
 * are structural placeholders — MUST be validated with the actual TP4056 circuit.
 * =============================================================================
 */

#ifndef BATTERY_H
#define BATTERY_H

#include <Arduino.h>
#include "../config/firmware_config.h"
#include "../utils/Logger.h"

class Battery {
public:
  /**
   * Initializes the battery monitoring interface.
   * Sets up the ADC pin mode.
   * Call once in setup().
   *
   * HARDWARE PENDING: Requires voltage divider circuit wired to A0.
   */
  void begin();

  /**
   * Reads the raw ADC value from the battery monitoring pin.
   *
   * HARDWARE PENDING: Returns 0 until hardware is connected.
   * NOTE: Must not conflict with ML8511 ADC reads (pin sharing issue — see header).
   *
   * @return Raw ADC value (0–1023)
   */
  int readRawADC();

  /**
   * Converts raw ADC to battery voltage.
   * Accounts for the NodeMCU ADC voltage divider.
   *
   * HARDWARE PENDING: Voltage divider ratio must be measured on actual hardware.
   *
   * @param rawAdc Raw value from readRawADC()
   * @return Battery voltage in Volts
   */
  float convertToVoltage(int rawAdc);

  /**
   * Converts battery voltage to estimated percentage.
   *
   * HARDWARE PENDING: The voltage-to-percentage mapping is Li-Ion specific
   * and must be calibrated against the actual battery discharge curve.
   *
   * Approximate linear mapping:
   *   BATTERY_MAX_VOLTAGE → 100%
   *   BATTERY_MIN_VOLTAGE → 0%
   *
   * Linear approximation is NOT accurate for Li-Ion chemistry (which has a
   * non-linear discharge curve). A lookup table should be implemented during
   * hardware validation.
   *
   * @param voltage Battery voltage from convertToVoltage()
   * @return Estimated percentage (0–100), clamped to valid range
   */
  int convertToPercentage(float voltage);

  /**
   * Performs a full battery read and returns the estimated percentage.
   * Returns -1 if hardware is not available.
   *
   * @return Battery percentage (0–100) or -1 if hardware unavailable
   */
  int readPercentage();

  /**
   * Returns the last measured battery voltage.
   * @return Voltage in Volts (0.0 until hardware connected)
   */
  float getLastVoltage() const;

private:
  float _lastVoltage = 0.0f;
};

#endif // BATTERY_H
