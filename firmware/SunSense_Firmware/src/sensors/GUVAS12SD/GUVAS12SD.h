#ifndef GUVAS12SD_H
#define GUVAS12SD_H

#include <Arduino.h>

#include "../../config/firmware_config.h"
#include "../../utils/Logger.h"


class GUVAS12SD {

public:

    explicit GUVAS12SD(int outPin);


    // Initialize sensor.
    void begin();


    // Read averaged ADC value.
    int readRawADC();


    // Convert ADC reading to sensor output voltage.
    float convertToVoltage(int rawAdc);


    // Convert sensor output voltage to estimated UV Index.
    float convertToUVIndex(float voltage);


    // Convert UV Index to erythemally weighted intensity.
    float convertToUVIntensity(float uvIndex);


    // Complete reading cycle.
    float readUVIndex();


    // Getters.
    int getLastRawADC() const;

    float getLastVoltage() const;

    float getLastCorrectedVoltage() const;

    float getLastUVIndex() const;

    float getLastUVIntensity() const;


    // Returns true when ADC/output is near saturation.
    bool isSaturated() const;


private:

    int _outPin;


    int _lastRawADC;

    float _lastVoltage;
    
    float _lastCorrectedVoltage;

    float _lastUVIndex;

    float _lastUVIntensity;

    bool _saturated;
};


#endif // GUVAS12SD_H
