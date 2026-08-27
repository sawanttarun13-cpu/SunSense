#ifndef GUVAS12SD_H
#define GUVAS12SD_H

#include <Arduino.h>
#include "../../config/firmware_config.h"
#include "../../utils/Logger.h"

#define ADC_SAMPLES 10

class GUVAS12SD {
public:
  /**
   * @param outPin The analog pin connected to the GUVA-S12SD SIG/OUT pin
   */
  GUVAS12SD(int outPin);

  /**
   * Initialize the sensor hardware.
   */
  void begin();

  /**
   * Reads raw ADC value.
   * @return Averaged 10-bit integer (0-1023)
   */
  int readRawADC();

  /**
   * Converts raw ADC value to voltage.
   * @param rawAdc The 10-bit ADC value
   * @return Voltage in Volts (0.0 to 3.3)
   */
  float convertToVoltage(int rawAdc);

  /**
   * Converts voltage to UV Index using the GUVA-S12SD specific formula.
   * @param voltage The measured voltage
   * @return Standardized UV Index
   */
  float convertToUVIndex(float voltage);

  /**
   * Approximates UV Intensity (mW/cm2) based on the UV Index.
   * @param uvIndex The calculated UV Index
   * @return UV Intensity in mW/cm2
   */
  float convertToUVIntensity(float uvIndex);

  /**
   * Performs a complete read cycle (ADC -> V -> UVI)
   * @return The calculated UV Index
   */
  float readUVIndex();

  // Getters for the most recent values
  int   getLastRawADC() const;
  float getLastVoltage() const;
  float getLastUVIndex() const;
  float getLastUVIntensity() const;

private:
  int _outPin;

  int   _lastRawADC;
  float _lastVoltage;
  float _lastUVIndex;
  float _lastUVIntensity;
};

#endif // GUVAS12SD_H
