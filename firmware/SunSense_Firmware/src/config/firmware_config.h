/**
 * =============================================================================
 * File: firmware_config.h
 * Project: SunSense Firmware
 * Phase: 5B Hardware Calibration
 *
 * Hardware:
 *   ESP8266 NodeMCU
 *   CJMCU-GUVA-S12SD
 *   1.3" I2C SH1106 OLED
 *   TP4056 Li-Ion charger
 *
 * SENSOR MODIFICATION:
 *   GUVA-S12SD first-stage feedback resistor changed:
 *
 *       OLD: 10 MΩ (106 / 01F)
 *       NEW:  1 MΩ (01E)
 *
 *   The second amplifier stage remains enabled.
 *
 *   For this configuration, the approximate UVI conversion is:
 *
 *       UVI = Vout × (10 / 0.61)
 *           ≈ Vout × 16.39
 *
 * =============================================================================
 */

#ifndef FIRMWARE_CONFIG_H
#define FIRMWARE_CONFIG_H


// =============================================================================
// FIRMWARE
// =============================================================================

#define FIRMWARE_VERSION "1.1.0-phase8"


// =============================================================================
// BACKEND
// =============================================================================

#define BACKEND_BASE_URL     "https://sunsense.onrender.com"

#define API_PREFIX           "/api/v1"

#define ENDPOINT_READINGS    "/api/v1/readings"
#define ENDPOINT_HEARTBEAT   "/api/v1/device/heartbeat"
#define ENDPOINT_SERVER_TIME "/api/v1/server/time"
#define ENDPOINT_AUTH_CHECK  "/api/v1/device/authenticate"
#define ENDPOINT_HEALTH      "/api/v1/health"
#define ENDPOINT_OTA         "/api/v1/device/firmware"


// =============================================================================
// DEVICE
// =============================================================================
//
// IMPORTANT:
// Keep real credentials out of Git.
// Put your actual values here only in the local copy that you flash.
// =============================================================================

#define DEVICE_ID       "b7942c10-c244-4b76-8f4f-62eaa7bf189d"
#define DEVICE_API_KEY "6d66e17190a8cc6033e2f0eb584ceca157d32b1b37a8397a36ac0ff4b2c2c1ee"


// =============================================================================
// WIFI
// =============================================================================

#define WIFI_SSID     "OnePlus Nord CE 3 Lite 5G 1c15"
#define WIFI_PASSWORD "244466666"

#define WIFI_CONNECT_TIMEOUT_MS   15000
#define WIFI_RECONNECT_DELAY_MS    5000
#define WIFI_MAX_RETRIES              5


// =============================================================================
// TIMING
// =============================================================================

// Read UV every 10 seconds for testing (production is 15 mins).
#define READING_INTERVAL_MS       10000UL

// Send heartbeat every 2 minutes.
#define HEARTBEAT_INTERVAL_MS    120000UL

// Retry queued readings every 30 seconds.
#define QUEUE_FLUSH_INTERVAL_MS   30000UL

// Re-sync server time every hour.
#define TIME_SYNC_INTERVAL_MS  3600000UL

// Check for OTA updates once every 24 hours.
#define OTA_CHECK_INTERVAL_MS 86400000UL


// =============================================================================
// OFFLINE QUEUE
// =============================================================================

#define QUEUE_MAX_SIZE          200
#define QUEUE_BATCH_SIZE         50


// =============================================================================
// GUVA-S12SD
// =============================================================================

#define GUVAS12SD_OUT_PIN A0


// -----------------------------------------------------------------------------
// ADC CONFIGURATION
// -----------------------------------------------------------------------------
//
// PROVISIONAL — validated against physical measurements:
//
//   ADC 0    -> 0.0 V
//   ADC 1023 -> ~3.3 V
//
// Previous saturated reading confirmed:
//
//   ADC=1024, V=3.303 V
//
// The code clamps ADC values to 0..1023.
//
// -----------------------------------------------------------------------------

#define GUVAS12SD_ADC_RESOLUTION 1023.0f
#define GUVAS12SD_ADC_REF_V       3.30f


// =============================================================================
// SENSOR FILTERING
// =============================================================================

// Exponential Moving Average filter alpha.
// Lower = smoother but slower. Higher = faster but noisier.
#define UVI_FILTER_ALPHA 0.20f

// Number of analog samples averaged for each reading.
#define GUVAS12SD_ADC_SAMPLES 64

// Delay between ADC samples (ms).
#define GUVAS12SD_SAMPLE_DELAY_MS 3


// =============================================================================
// GUVA-S12SD CALIBRATION
// =============================================================================
//
// PROVISIONAL — subject to physical validation.
//
// Hardware configuration:
//
//   1 MΩ feedback resistor
//   + second amplifier stage gain ≈ 6.1
//
// Therefore:
//
//   UVI ≈ VOUT × (10 / 0.61)
//   UVI ≈ VOUT × 16.39
//
// This is an approximation and should ultimately be calibrated against
// a reliable UV Index reference.
//
// OLD formula (10 MΩ resistor):  UVI = VOUT × 10
// NEW formula (1 MΩ resistor):   UVI = VOUT × 16.39
//
// -----------------------------------------------------------------------------

// Hardware conversion based on empirical test.
// 0.141V outdoors corresponds to a UVI of 5.5.
// Therefore: UVI = VOUT * 40.0
#define GUVAS12SD_BASE_UVI_PER_VOLT 40.0f


// -----------------------------------------------------------------------------
// Calibration fine adjustment
//
// Formula:
//
//   UVI = ((voltage - offset_V) × BASE_UVI_PER_VOLT × gain) + offset_UVI
//
// Start with neutral values:
//   gain       = 1.0 (PROVISIONAL until after reference test)
//   offset_V   = 0.0 (PROVISIONAL - waiting for physical measurement)
//   offset_UVI = 0.0
//
// NOTE: Final values require covered + outdoor shade + direct sun + UV reference testing.
// After comparing against a trusted reference, adjust gain.
//
// Example:
// If sensor reads 1.4 UVI but reference says 2.0:
// correction gain ≈ 2.0 / 1.4 = 1.429
// -----------------------------------------------------------------------------

// Empirical calibration multiplier (PROVISIONAL)
// Reverted to 1.0 as previous 0.440 gain was causing extremely low outdoor readings.
#define GUVAS12SD_CALIBRATION_GAIN 1.0f

// Sensor dark baseline voltage (PROVISIONAL)
#define GUVAS12SD_DARK_OFFSET_V 0.000f

// UVI constant offset adjustment (PROVISIONAL)
// Reverted to 0.0.
#define GUVAS12SD_CALIBRATION_OFFSET_UVI 0.0f


// =============================================================================
// OUTPUT LIMITS
// =============================================================================

// Software display/data limit.
// This is NOT the physical sensor range.
#define GUVAS12SD_MAX_UVI 15.0f


// =============================================================================
// SATURATION DETECTION
// =============================================================================
//
// PROVISIONAL thresholds.
//
// When the output gets close to the NodeMCU A0 rail, the sensor/amplifier
// may be saturated and the exact environmental UVI can no longer be inferred.
//
// We flag the reading as SATURATED instead of pretending it is accurate.
//
// A0 reaching approximately 3.3 V is still a diagnostic condition even
// after changing the UVI conversion factor. Do not treat the new formula
// as proof that the electrical problem is solved.
//
// -----------------------------------------------------------------------------

#define GUVAS12SD_SATURATION_ADC 1000
#define GUVAS12SD_SATURATION_V   3.20f


// =============================================================================
// UV INTENSITY
// =============================================================================
//
// EPA defines:
//
//   1 UV Index = 25 mW/m²
//
// Conversion:
//
//   25 mW/m² = 0.0025 mW/cm²
//
// Therefore:
//
//   intensity(mW/cm²) = UVI × 0.0025
//
// This is erythemally weighted UV intensity represented by the UV Index;
// it is NOT the raw optical power output of the GUVA photodiode.
//
// CORRECTION: Previous firmware used 0.025 mW/cm² per UVI (off by 10×).
// =============================================================================

#define GUVAS12SD_MWCM2_PER_UVI 0.0025f


// =============================================================================
// OLED
// =============================================================================

#define OLED_SDA_PIN  D2
#define OLED_SCL_PIN  D1

#define OLED_I2C_ADDR 0x3C

#define OLED_WIDTH  128
#define OLED_HEIGHT 64


// =============================================================================
// BATTERY
// =============================================================================
//
// Battery measurement remains disabled because A0 is occupied by the
// GUVA sensor.
//
// A separate ADC/multiplexer/external battery monitor is required.
// Do NOT connect battery voltage to A0.
// =============================================================================

#define BATTERY_ADC_PIN A0

#define BATTERY_MAX_VOLTAGE 4.20f
#define BATTERY_MIN_VOLTAGE 3.00f


// =============================================================================
// SERIAL DEBUG
// =============================================================================

#define DEBUG_ENABLED 1
#define SERIAL_BAUD 115200


#endif // FIRMWARE_CONFIG_H
