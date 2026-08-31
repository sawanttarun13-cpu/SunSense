/**
 * =============================================================================
 * SunSense Firmware
 * =============================================================================
 *
 * Phase 5B
 *
 * Hardware:
 *   ESP8266 NodeMCU
 *   CJMCU-GUVA-S12SD
 *   1.3" I2C SH1106 OLED
 *   TP4056
 *
 * GUVA hardware modification:
 *
 *   10 MΩ feedback resistor -> 1 MΩ
 *
 * Second amplifier stage remains active.
 *
 * UVI calculation:
 *
 *   UVI = Vout × (100 / 6.1)
 *       ≈ Vout × 16.39
 *
 * =============================================================================
 */

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>


// =============================================================================
// MODULES
// =============================================================================

#include "src/config/firmware_config.h"
#include "src/utils/Logger.h"
#include "src/models/Reading.h"
#include "src/sensors/GUVAS12SD/GUVAS12SD.h"
#include "src/display/Display.h"
#include "src/battery/Battery.h"
#include "src/connectivity/WiFiManager.h"
#include "src/api/ApiClient.h"
#include "src/time/TimeSync.h"
#include "src/storage/OfflineQueue.h"
#include "src/network/OTAManager.h"


// =============================================================================
// OBJECTS
// =============================================================================

static GUVAS12SD sensor(
    GUVAS12SD_OUT_PIN
);

static Display display;

static Battery battery;

static WiFiManager wifiManager;

static ApiClient apiClient(
    BACKEND_BASE_URL
);

static TimeSync timeSync;

static OfflineQueue queue;

static OTAManager otaManager;


// =============================================================================
// STATE
// =============================================================================

static uint32_t lastReadingTime = 0;

static uint32_t lastHeartbeatTime = 0;

static uint32_t lastTimeSyncTime = 0;

static uint32_t lastDisplayTime = 0;

static uint32_t lastOtaCheckTime = 0;
static bool otaCheckedSinceBoot = false;

static uint32_t bootTime = 0;

static bool wasConnected = false;

static bool deviceAuthenticated = false;


// =============================================================================
// UVI SMOOTHING
// =============================================================================
//
// EMA:
//
//     filtered = previous * (1-alpha)
//                + new * alpha
//
// Lower alpha = smoother but slower.
// Higher alpha = faster but noisier.
//

static bool uviFilterInitialized = false;

static float filteredUVI = 0.0f;


// =============================================================================
// FUNCTION DECLARATIONS
// =============================================================================

void onReconnect();

void takeAndProcessReading(
    bool isOnline
);

void flushOfflineQueue();

void sendHeartbeat();


// =============================================================================
// UVI FILTER
// =============================================================================

float smoothUVIndex(
    float newValue
) {

    if (
        !uviFilterInitialized
    ) {

        filteredUVI =
            newValue;

        uviFilterInitialized =
            true;

        return filteredUVI;
    }


    filteredUVI =

        (
            filteredUVI
            *
            (1.0f - UVI_FILTER_ALPHA)
        )

        +

        (
            newValue
            *
            UVI_FILTER_ALPHA
        );


    if (filteredUVI < 0.0f)
        filteredUVI = 0.0f;


    if (
        filteredUVI >
        GUVAS12SD_MAX_UVI
    ) {

        filteredUVI =
            GUVAS12SD_MAX_UVI;
    }


    return filteredUVI;
}


// =============================================================================
// SETUP
// =============================================================================

void setup() {

    bootTime =
        millis();


    // -------------------------------------------------------------------------
    // SERIAL
    // -------------------------------------------------------------------------

    Logger::begin();


    Logger::info(
        "SYSTEM",

        "SunSense Firmware v"
        + String(FIRMWARE_VERSION)
        + " booting..."
    );


    Logger::info(
        "SYSTEM",

        "GUVA-S12SD hardware profile:"
    );


    Logger::info(
        "SYSTEM",

        "1M feedback resistor + 6.1x second stage"
    );


    Logger::info(
        "SYSTEM",

        "UVI factor = 1.639 UVI/V"
    );


    // -------------------------------------------------------------------------
    // SENSOR
    // -------------------------------------------------------------------------

    sensor.begin();


    // -------------------------------------------------------------------------
    // DISPLAY
    // -------------------------------------------------------------------------

    display.begin();

    display.showSplash();


    delay(1500);


    // -------------------------------------------------------------------------
    // BATTERY
    // -------------------------------------------------------------------------

    battery.begin();


    // -------------------------------------------------------------------------
    // QUEUE
    // -------------------------------------------------------------------------

    queue.begin();


    // -------------------------------------------------------------------------
    // WIFI
    // -------------------------------------------------------------------------

    wifiManager.begin();

    wifiManager.connect();


    display.showConnecting();


    Logger::info(
        "SYSTEM",
        "Setup complete — entering main loop"
    );
}


// =============================================================================
// LOOP
// =============================================================================

void loop() {

    uint32_t now =
        millis();


    // =========================================================================
    // WIFI
    // =========================================================================

    wifiManager.loop();


    bool isConnected =
        wifiManager.isConnected();


    // =========================================================================
    // CONNECTION STATE CHANGE
    // =========================================================================

    if (
        isConnected
        &&
        !wasConnected
    ) {

        Logger::info(
            "SYSTEM",
            "Wi-Fi connected — post-connect sequence"
        );


        onReconnect();
    }


    wasConnected =
        isConnected;


    // =========================================================================
    // PERIODIC AUTHENTICATION RETRY
    // =========================================================================

    static uint32_t lastAuthRetryTime = 0;
    if (isConnected && !deviceAuthenticated && (now - lastAuthRetryTime >= 15000UL)) {
        lastAuthRetryTime = now;
        Logger::info("SYSTEM", "Retrying post-connect sequence (auth/time)...");
        onReconnect();
    }

    // =========================================================================
    // UV READING
    // =========================================================================

    if (
        now - lastReadingTime
        >= READING_INTERVAL_MS
    ) {

        lastReadingTime =
            now;


        takeAndProcessReading(
            isConnected
        );
    }


    // =========================================================================
    // HEARTBEAT
    // =========================================================================

    if (

        isConnected

        &&

        (
            now - lastHeartbeatTime
            >= HEARTBEAT_INTERVAL_MS
        )
    ) {

        lastHeartbeatTime =
            now;


        sendHeartbeat();
    }


    // =========================================================================
    // PERIODIC TIME SYNC
    // =========================================================================

    if (

        isConnected

        &&

        (
            now - lastTimeSyncTime
            >= TIME_SYNC_INTERVAL_MS
        )
    ) {

        lastTimeSyncTime =
            now;


        Logger::info(
            "TIME",
            "Periodic time resync"
        );


        timeSync.sync(
            BACKEND_BASE_URL
        );
    }


    // =========================================================================
    // DISPLAY
    // =========================================================================

    if (
        now - lastDisplayTime
        >= 2000UL
    ) {

        lastDisplayTime =
            now;


        if (!isConnected) {

            display.showOffline(
                filteredUVI,
                queue.size()
            );

        } else {

            display.showReading(

                filteredUVI,

                sensor.getLastVoltage(),

                true,

                queue.size()
            );
        }
    }


    // =========================================================================
    // QUEUE FLUSH
    // =========================================================================

    static uint32_t lastQueueFlush =
        0;


    if (

        isConnected

        &&

        deviceAuthenticated

        &&

        !queue.isEmpty()

        &&

        (
            now - lastQueueFlush
            >= QUEUE_FLUSH_INTERVAL_MS
        )
    ) {

        lastQueueFlush =
            now;


        flushOfflineQueue();
    }


    // =========================================================================
    // OTA UPDATE CHECK
    // =========================================================================

    if (
        isConnected
        && deviceAuthenticated
        && queue.isEmpty() // Queue MUST be empty to prioritize data safety
    ) {
        bool shouldCheckOta = false;
        
        if (!otaCheckedSinceBoot) {
            shouldCheckOta = true;
        } else if (now - lastOtaCheckTime >= OTA_CHECK_INTERVAL_MS) {
            shouldCheckOta = true;
        }

        if (shouldCheckOta) {
            lastOtaCheckTime = now;
            otaCheckedSinceBoot = true;
            
            otaManager.checkAndUpdate(
                BACKEND_BASE_URL,
                DEVICE_ID,
                DEVICE_API_KEY,
                FIRMWARE_VERSION
            );
        }
    }


    // =========================================================================
    // WATCHDOG
    // =========================================================================

    yield();
}


// =============================================================================
// RECONNECT
// =============================================================================

void onReconnect() {

    // -------------------------------------------------------------------------
    // Time synchronization
    // -------------------------------------------------------------------------

    if (
        !timeSync.isSynced()
    ) {

        lastTimeSyncTime =
            millis();


        timeSync.sync(
            BACKEND_BASE_URL
        );
    }


    // -------------------------------------------------------------------------
    // Backend health
    // -------------------------------------------------------------------------

    bool backendOk =
        apiClient.checkHealth();


    if (!backendOk) {

        Logger::warn(
            "SYSTEM",
            "Backend health check failed"
        );


        return;
    }


    // -------------------------------------------------------------------------
    // Device authentication
    // -------------------------------------------------------------------------

    if (
        !deviceAuthenticated
    ) {

        ApiResult authResult =
            apiClient.authenticate();


        deviceAuthenticated =
            authResult.success;


        if (
            !authResult.success
        ) {

            Logger::error(
                "SYSTEM",

                "Device authentication failed: "
                + authResult.message
            );


            return;
        }


        Logger::info(
            "SYSTEM",
            "Device authenticated successfully"
        );
    }


    // -------------------------------------------------------------------------
    // Backend time
    // -------------------------------------------------------------------------

    lastTimeSyncTime =
        millis();


    timeSync.sync(
        BACKEND_BASE_URL
    );


    // -------------------------------------------------------------------------
    // Flush queue
    // -------------------------------------------------------------------------

    if (
        !queue.isEmpty()
    ) {

        flushOfflineQueue();
    }
}


// =============================================================================
// SENSOR READING
// =============================================================================

void takeAndProcessReading(
    bool isOnline
) {

    Reading r =
        createEmptyReading();


    // -------------------------------------------------------------------------
    // Raw sensor reading
    // -------------------------------------------------------------------------

    r.rawAdc =
        sensor.readRawADC();


    // -------------------------------------------------------------------------
    // Voltage
    // -------------------------------------------------------------------------

    r.voltageV =
        sensor.convertToVoltage(
            r.rawAdc
        );


    // -------------------------------------------------------------------------
    // Sensor UVI
    // -------------------------------------------------------------------------

    float rawUVI =
        sensor.convertToUVIndex(
            r.voltageV
        );


    // -------------------------------------------------------------------------
    // Smooth value
    // -------------------------------------------------------------------------

    r.uvIndex =
        smoothUVIndex(
            rawUVI
        );


    // -------------------------------------------------------------------------
    // Intensity
    // -------------------------------------------------------------------------

    r.uvIntensity =
        sensor.convertToUVIntensity(
            r.uvIndex
        );


    // -------------------------------------------------------------------------
    // Timestamp
    // -------------------------------------------------------------------------

    if (
        timeSync.isSynced()
    ) {

        timeSync.getCurrentISO8601(
            r.recordedAt
        );

    } else {

        snprintf(
            r.recordedAt,
            sizeof(r.recordedAt),
            "1970-01-01T00:00:00Z"
        );


        Logger::warn(
            "SENSOR",
            "Time not synced — epoch timestamp"
        );
    }


    // -------------------------------------------------------------------------
    // Saturation
    // -------------------------------------------------------------------------

    bool saturated =
        sensor.isSaturated();


    // -------------------------------------------------------------------------
    // Diagnostics
    // -------------------------------------------------------------------------

    Logger::info(
        "S12SD",

        "ADC="
        + String(r.rawAdc)

        + " | V="
        + String(r.voltageV, 3)
        + "V"
        
        + " | CorrectedV="
        + String(sensor.getLastCorrectedVoltage(), 3)
        + "V"

        + " | RawUVI="
        + String(rawUVI, 2)

        + " | FilteredUVI="
        + String(r.uvIndex, 2)

        + " | UV="
        + String(r.uvIntensity, 5)
        + " mW/cm2"

        + " | "
        + (
            saturated
            ? "SATURATED"
            : "OK"
        )
    );


    Logger::info(
        "SENSOR",

        "Reading | UVI: "
        + String(r.uvIndex, 1)

        + " | ts: "
        + String(r.recordedAt)

        + " | online: "
        + String(isOnline)
    );


    // -------------------------------------------------------------------------
    // Display
    // -------------------------------------------------------------------------

    display.showReading(

        r.uvIndex,

        r.voltageV,

        isOnline,

        queue.size()
    );


    // -------------------------------------------------------------------------
    // Upload
    // -------------------------------------------------------------------------

    if (
        isOnline
        &&
        deviceAuthenticated
    ) {

        ApiResult res =
            apiClient.sendReadings(
                &r,
                1
            );


        if (!res.success) {

            Logger::warn(
                "API",
                "Direct reading upload failed — queued"
            );


            queue.enqueue(
                r
            );
        }

    } else {

        queue.enqueue(
            r
        );


        Logger::info(
            "QUEUE",

            "Reading queued offline | size="
            + String(queue.size())
        );
    }
}


// =============================================================================
// OFFLINE QUEUE FLUSH
// =============================================================================

void flushOfflineQueue() {

    if (
        queue.isEmpty()
    ) {

        return;
    }


    int total =
        queue.size();


    Logger::info(
        "QUEUE",

        "Starting queue flush | "
        + String(total)
        + " readings"
    );


    display.showUploading(
        total
    );


    while (
        !queue.isEmpty()
    ) {

        Reading batch[
            QUEUE_BATCH_SIZE
        ];


        int batchSize =
            queue.getBatch(
                batch,
                QUEUE_BATCH_SIZE
            );


        if (
            batchSize <= 0
        ) {

            break;
        }


        ApiResult res =
            apiClient.sendReadings(
                batch,
                batchSize
            );


        if (
            res.success
        ) {

            queue.removeUploaded(
                batchSize
            );


            Logger::info(
                "QUEUE",

                "Batch uploaded | sent="
                + String(batchSize)

                + " | remaining="
                + String(queue.size())
            );

        } else {

            Logger::error(
                "QUEUE",

                "Batch upload failed: "
                + res.message
            );
            
            if (res.httpCode == 401 || res.httpCode == 403) {
                Logger::error("QUEUE", "Authentication revoked, halting queue flush");
                deviceAuthenticated = false;
            }


            break;
        }


        yield();


        delay(200);
    }


    if (
        queue.isEmpty()
    ) {

        Logger::info(
            "QUEUE",
            "Queue fully flushed"
        );
    }
}


// =============================================================================
// HEARTBEAT
// =============================================================================

void sendHeartbeat() {

    if (
        !wifiManager.isConnected()
    ) {

        return;
    }


    int battPct =
        battery.readPercentage();


    bool isCharging =
        false;


    int rssi =
        wifiManager.getRSSI();


    unsigned long uptime =
        (
            millis()
            -
            bootTime
        )
        /
        1000UL;


    String sensorHealth;


    if (
        sensor.isSaturated()
    ) {

        sensorHealth =
            "SATURATED";

    } else {

        sensorHealth =
            "OK";
    }


    Logger::info(
        "SYSTEM",

        "Heartbeat | batt="
        + String(battPct)

        + "% | rssi="
        + String(rssi)

        + " dBm | uptime="
        + String(uptime)

        + "s | sensor="
        + sensorHealth
    );


    apiClient.sendHeartbeat(

        battPct,

        isCharging,

        rssi,

        uptime,

        sensorHealth
    );
}
