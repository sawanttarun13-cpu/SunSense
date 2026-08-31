#include "GUVAS12SD.h"


// =============================================================================
// CONSTRUCTOR
// =============================================================================

GUVAS12SD::GUVAS12SD(int outPin)

    : _outPin(outPin),
      _lastRawADC(0),
      _lastVoltage(0.0f),
      _lastCorrectedVoltage(0.0f),
      _lastUVIndex(0.0f),
      _lastUVIntensity(0.0f),
      _saturated(false) {

}


// =============================================================================
// BEGIN
// =============================================================================

void GUVAS12SD::begin() {

    _lastRawADC      = 0;
    _lastVoltage     = 0.0f;
    _lastCorrectedVoltage = 0.0f;
    _lastUVIndex     = 0.0f;
    _lastUVIntensity = 0.0f;
    _saturated       = false;


    Logger::info(
        "SENSOR",
        "GUVA-S12SD initialized"
    );


    Logger::info(
        "SENSOR",
        "Hardware calibration: 1M feedback resistor"
    );


    Logger::info(
        "SENSOR",
        "UVI conversion: Vout x 16.39"
    );


    Logger::info(
        "SENSOR",
        "ADC samples: "
        + String(GUVAS12SD_ADC_SAMPLES)
    );
}


// =============================================================================
// READ ADC
// =============================================================================

int GUVAS12SD::readRawADC() {

    uint32_t sum = 0;


    for (
        int i = 0;
        i < GUVAS12SD_ADC_SAMPLES;
        i++
    ) {

        int sample =
            analogRead(_outPin);


        // ESP8266 ADC is nominally 0..1023.
        // Clamp unexpected values defensively.

        if (sample < 0)
            sample = 0;

        if (sample > 1023)
            sample = 1023;


        sum += sample;


        delay(
            GUVAS12SD_SAMPLE_DELAY_MS
        );


        yield();
    }


    _lastRawADC =
        (int)(
            sum /
            GUVAS12SD_ADC_SAMPLES
        );


    if (_lastRawADC < 0)
        _lastRawADC = 0;


    if (_lastRawADC > 1023)
        _lastRawADC = 1023;


    return _lastRawADC;
}


// =============================================================================
// ADC -> SENSOR VOLTAGE
// =============================================================================

float GUVAS12SD::convertToVoltage(
    int rawAdc
) {

    if (rawAdc < 0)
        rawAdc = 0;


    if (
        rawAdc >
        (int)GUVAS12SD_ADC_RESOLUTION
    ) {

        rawAdc =
            (int)GUVAS12SD_ADC_RESOLUTION;
    }


    _lastVoltage =

        (
            (float)rawAdc /
            GUVAS12SD_ADC_RESOLUTION
        )
        *
        GUVAS12SD_ADC_REF_V;


    return _lastVoltage;
}


// =============================================================================
// VOLTAGE -> UV INDEX
// =============================================================================

float GUVAS12SD::convertToUVIndex(
    float voltage
) {

    _saturated = false;


    if (voltage <= 0.0f) {

        _lastUVIndex = 0.0f;

        return 0.0f;
    }


    // -------------------------------------------------------------------------
    // Detect saturation.
    // -------------------------------------------------------------------------

    if (
        _lastRawADC >=
        GUVAS12SD_SATURATION_ADC
        ||
        voltage >=
        GUVAS12SD_SATURATION_V
    ) {

        _saturated = true;


        Logger::warn(
            "SENSOR",

            "[S12SD] SENSOR SATURATED | ADC="
            + String(_lastRawADC)

            + " | V="
            + String(voltage, 3)
            + "V"
        );


        // We cannot know the exact UVI once the amplifier
        // is saturated.

        // Return the highest defensible calculated value
        // from the measurable voltage, but mark the condition.

        voltage =
            GUVAS12SD_SATURATION_V;
    }


    // -------------------------------------------------------------------------
    // Subtract physical dark offset
    // -------------------------------------------------------------------------

    float correctedVoltage =
        voltage -
        GUVAS12SD_DARK_OFFSET_V;


    if (correctedVoltage < 0.0f)
        correctedVoltage = 0.0f;
        
    _lastCorrectedVoltage = correctedVoltage;


    // -------------------------------------------------------------------------
    // Base GUVA-S12SD calculation
    //
    // 1M first-stage resistor + second stage gain ~6.1:
    //
    // UVI ≈ Vout × (100 / 6.1)
    //     ≈ Vout × 16.39
    //
    // -------------------------------------------------------------------------

    float uvIndex =

        correctedVoltage
        *
        GUVAS12SD_BASE_UVI_PER_VOLT;


    // -------------------------------------------------------------------------
    // User calibration gain
    // -------------------------------------------------------------------------

    uvIndex *=
        GUVAS12SD_CALIBRATION_GAIN;


    uvIndex +=
        GUVAS12SD_CALIBRATION_OFFSET_UVI;

    // -------------------------------------------------------------------------
    // Darkness Clamp
    // If voltage is extremely low (e.g. night time), suppress ghost UVI
    // caused by a positive calibration offset.
    // -------------------------------------------------------------------------

    if (voltage < 0.005f) {
        uvIndex = 0.0f;
    }


    // -------------------------------------------------------------------------
    // Clamp
    // -------------------------------------------------------------------------

    if (uvIndex < 0.0f)
        uvIndex = 0.0f;


    if (
        uvIndex >
        GUVAS12SD_MAX_UVI
    ) {

        uvIndex =
            GUVAS12SD_MAX_UVI;
    }


    _lastUVIndex =
        uvIndex;


    return _lastUVIndex;
}


// =============================================================================
// UV INDEX -> UV INTENSITY
// =============================================================================

float GUVAS12SD::convertToUVIntensity(
    float uvIndex
) {

    if (uvIndex < 0.0f)
        uvIndex = 0.0f;


    float intensity =

        uvIndex
        *
        GUVAS12SD_MWCM2_PER_UVI;


    _lastUVIntensity =
        intensity;


    return intensity;
}


// =============================================================================
// COMPLETE READ
// =============================================================================

float GUVAS12SD::readUVIndex() {

    int raw =
        readRawADC();


    float voltage =
        convertToVoltage(raw);


    float uvIndex =
        convertToUVIndex(voltage);


    float intensity =
        convertToUVIntensity(uvIndex);


    Logger::info(
        "S12SD",

        "ADC="
        + String(raw)

        + " | V="
        + String(voltage, 3)
        + "V"
        
        + " | CorrectedV="
        + String(_lastCorrectedVoltage, 3)
        + "V"

        + " | RawUVI="
        + String(uvIndex, 2)

        + " | FilteredUVI="
        + String(uvIndex, 2) // Will be properly logged in main.cpp after EMA

        + " | UV="
        + String(intensity, 5)
        + " mW/cm2"

        + " | "
        + (
            _saturated
            ? "SATURATED"
            : "OK"
        )
    );


    return uvIndex;
}


// =============================================================================
// GETTERS
// =============================================================================

int GUVAS12SD::getLastRawADC() const {

    return _lastRawADC;
}


float GUVAS12SD::getLastVoltage() const {

    return _lastVoltage;
}


float GUVAS12SD::getLastCorrectedVoltage() const {

    return _lastCorrectedVoltage;
}


float GUVAS12SD::getLastUVIndex() const {

    return _lastUVIndex;
}


float GUVAS12SD::getLastUVIntensity() const {

    return _lastUVIntensity;
}


bool GUVAS12SD::isSaturated() const {

    return _saturated;
}
