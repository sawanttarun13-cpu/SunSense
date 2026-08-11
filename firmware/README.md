# SunSense Firmware — Phase 5A

## Overview

This is the ESP8266 Arduino firmware for the **SunSense UV Monitoring Keychain**.  
It is the software foundation for the physical IoT device that will measure UV exposure and report data to the SunSense backend.

> **Phase 5A Status: SOFTWARE FOUNDATION COMPLETE**  
> Physical hardware has NOT been connected or tested in this phase.  
> All hardware-dependent functionality is stubbed with clearly documented placeholders.

---

## Hardware Target

| Component | Model |
|---|---|
| Microcontroller | ESP8266 NodeMCU (ESP-12E) |
| UV Sensor | ML8511 Analog UV Sensor |
| Display | 1.3-inch I2C OLED (SSD1306 or SH1106, 128×64) |
| Battery | 3.7V Li-Ion (single cell) |
| Charger/Protection | TP4056 module |

---

## Folder Structure

```
firmware/
├── SunSense_Firmware/
│   └── SunSense_Firmware.ino   ← Main Arduino sketch (open this in Arduino IDE)
│
├── config/
│   └── firmware_config.h       ← All configuration constants and pin assignments
│
├── sensors/
│   └── ML8511/
│       ├── ML8511.h            ← UV sensor interface
│       └── ML8511.cpp          ← UV sensor implementation (HARDWARE PENDING)
│
├── display/
│   ├── Display.h               ← OLED display interface
│   └── Display.cpp             ← OLED display implementation (HARDWARE PENDING)
│
├── battery/
│   ├── Battery.h               ← Battery monitor interface
│   └── Battery.cpp             ← Battery monitor implementation (HARDWARE PENDING)
│
├── connectivity/
│   ├── WiFiManager.h           ← Non-blocking Wi-Fi manager interface
│   └── WiFiManager.cpp         ← Wi-Fi state machine implementation
│
├── api/
│   ├── ApiClient.h             ← Backend API client interface
│   └── ApiClient.cpp           ← HTTP client implementation
│
├── time/
│   ├── TimeSync.h              ← Time synchronization interface
│   └── TimeSync.cpp            ← Server time + NTP fallback implementation
│
├── storage/
│   ├── OfflineQueue.h          ← Offline reading queue interface
│   └── OfflineQueue.cpp        ← In-memory circular buffer (SPIFFS migration pending)
│
├── models/
│   └── Reading.h               ← UV reading data struct
│
├── utils/
│   ├── Logger.h                ← Serial logger interface
│   └── Logger.cpp              ← Categorized Serial logger implementation
│
└── README.md                   ← This file
```

---

## How to Compile in Arduino IDE

### Step 1 — Install the ESP8266 Board Package

1. Open Arduino IDE.
2. Go to **File → Preferences**.
3. Add this URL to "Additional Boards Manager URLs":
   ```
   https://arduino.esp8266.com/stable/package_esp8266com_index.json
   ```
4. Go to **Tools → Board → Boards Manager**.
5. Search for `ESP8266` and install **esp8266 by ESP8266 Community**.

### Step 2 — Install Required Libraries

Open **Tools → Manage Libraries** and install:

| Library | Version | Purpose |
|---|---|---|
| ArduinoJson | 6.x or 7.x | JSON serialization/deserialization |
| *(HARDWARE PENDING)* Adafruit SSD1306 | latest | OLED display driver (SSD1306) |
| *(HARDWARE PENDING)* Adafruit GFX Library | latest | Graphics primitives for OLED |

### Step 3 — Select the Correct Board

Go to **Tools → Board → ESP8266 Boards** and select:
```
NodeMCU 1.0 (ESP-12E Module)
```

Recommended settings:
- Upload Speed: `115200`
- CPU Frequency: `80 MHz`
- Flash Size: `4MB (FS:2MB OTA:~1019KB)`

### Step 4 — Open the Sketch

Open `firmware/SunSense_Firmware/SunSense_Firmware.ino` in Arduino IDE.

> **IMPORTANT:** Arduino IDE requires all `.cpp` and `.h` files used by the sketch to be  
> accessible. Place the entire `firmware/` directory in your Arduino sketchbook or copy  
> the module folders next to the `.ino` file. Arduino IDE compilation resolves headers  
> relative to the sketch location.

### Step 5 — Configure Before Flashing

Before flashing, edit `firmware/config/firmware_config.h`:

```c
#define BACKEND_BASE_URL  "http://192.168.1.X:5000"  // Your machine's LAN IP
#define DEVICE_ID         "your-device-uuid-here"
#define DEVICE_API_KEY    "your-64-char-api-key-here"
#define WIFI_SSID         "YourNetworkName"
#define WIFI_PASSWORD     "YourNetworkPassword"
```

> ⚠️ **NEVER commit a file with real credentials to Git.**

### Step 6 — Compile / Upload

Click **Verify (✓)** to compile only.  
Click **Upload (→)** to flash to the device.

---

## Configuration

All settings are in [`firmware/config/firmware_config.h`](config/firmware_config.h).

| Constant | Purpose | Default |
|---|---|---|
| `BACKEND_BASE_URL` | Backend server URL | `http://192.168.1.100:5000` *(PLACEHOLDER)* |
| `DEVICE_ID` | UUID from device registration | *(PLACEHOLDER)* |
| `DEVICE_API_KEY` | 64-char hex API key | *(PLACEHOLDER)* |
| `WIFI_SSID` | Wi-Fi network name | *(PLACEHOLDER)* |
| `WIFI_PASSWORD` | Wi-Fi password | *(PLACEHOLDER)* |
| `READING_INTERVAL_MS` | How often sensor is read | 60,000 ms (1 min) |
| `HEARTBEAT_INTERVAL_MS` | How often heartbeat is sent | 120,000 ms (2 min) |
| `QUEUE_MAX_SIZE` | Max readings stored offline | 200 |
| `QUEUE_BATCH_SIZE` | Readings per upload batch | 50 |

---

## Device Authentication

The ESP8266 does **not** use user JWT tokens.  
It authenticates using two HTTP headers on all device-facing endpoints:

```
x-device-id: <your-device-uuid>
x-api-key:   <your-64-char-hex-key>
```

These credentials are obtained by:
1. Logging into the SunSense React frontend.
2. Navigating to the Device page.
3. Registering a new device (button in UI).
4. Copying the returned `deviceId` and `apiKey` into `firmware_config.h`.

> **Security:** The API key is returned **only once** at registration. It cannot be retrieved again. Store it immediately.

---

## Backend API Contract

The firmware communicates with these endpoints:

| Method | Endpoint | Status | Purpose |
|---|---|---|---|
| `POST` | `/api/v1/readings` | ✅ Live | Send UV readings |
| `POST` | `/api/v1/device/authenticate` | ✅ Live | Verify device credentials |
| `GET` | `/api/v1/health` | ✅ Live | Backend health check |
| `GET` | `/api/v1/server/time` | ⏳ Pending | Server time for accurate timestamps |
| `POST` | `/api/v1/device/heartbeat` | ⏳ Pending | Device health metrics |

**Pending endpoints** are implemented in the firmware with graceful `HTTP 404` handling. They will return `404` until the backend implements them. The firmware logs a warning and continues operating.

### Readings Payload Format

```json
{
  "readings": [
    { "uvIndex": 6.5, "recordedAt": "2026-08-03T12:00:00Z" },
    { "uvIndex": 7.1, "recordedAt": "2026-08-03T12:01:00Z" }
  ]
}
```

### Heartbeat Payload Format (Backend Pending)

```json
{
  "batteryPercentage": 85,
  "chargingState": false,
  "wifiRssi": -65,
  "firmwareVersion": "1.0.0-phase5a",
  "deviceUptimeSeconds": 3600,
  "sensorHealth": "OK"
}
```

---

## Server Time Synchronization

Primary source: `GET /api/v1/server/time` *(Backend implementation pending)*

Fallback: NTP pool (`pool.ntp.org`, `time.nist.gov`)

The `TimeSync` module:
- Tries the backend server endpoint first (handles `404` gracefully)
- Falls back to NTP if backend is unavailable
- Maintains local time using `millis()` offset after sync
- Re-syncs every `TIME_SYNC_INTERVAL_MS` (1 hour)

---

## Offline Queue

When Wi-Fi is unavailable:
1. Readings are stored in RAM (volatile in Phase 5A).
2. Maximum `QUEUE_MAX_SIZE` (200) readings stored.
3. Oldest reading is dropped if queue fills.

On reconnect:
1. Queue is flushed in batches of `QUEUE_BATCH_SIZE` (50).
2. Oldest readings uploaded first.
3. Readings removed **only after HTTP 200** acknowledgement.
4. Failed batches are retained and retried.

> **Persistent Storage (HARDWARE PENDING):**  
> SPIFFS or LittleFS integration will be added during hardware integration  
> to survive power cycles. The public `OfflineQueue` interface will not change.

---

## Logger Categories

| Category | Used For |
|---|---|
| `[SYSTEM]` | Boot, lifecycle events |
| `[WIFI]` | Wi-Fi connection events |
| `[API]` | HTTP requests and responses |
| `[TIME]` | Time synchronization |
| `[QUEUE]` | Offline queue operations |
| `[SENSOR]` | ML8511 readings |
| `[DISPLAY]` | OLED rendering events |
| `[BATTERY]` | Battery readings |

> **Security:** Logger NEVER prints Wi-Fi passwords, API keys, or device secrets.

---

## What Is Currently Verified (Phase 5A)

| Item | Status |
|---|---|
| Firmware folder structure | ✅ Verified — Arduino IDE compatible |
| All source files created | ✅ 19 files |
| No PlatformIO files created | ✅ Confirmed |
| No real secrets committed | ✅ Confirmed — all placeholders |
| API endpoint paths match backend docs | ✅ Verified against routes and docs |
| Device auth headers correct | ✅ `x-device-id` + `x-api-key` verified |
| Readings payload format correct | ✅ Matches `readings.validator.ts` |
| Heartbeat payload format correct | ✅ Matches `06_Request_Response_Models.md` |
| Server-time response format correct | ✅ Matches `06_Request_Response_Models.md` |
| Offline queue protocol correct | ✅ Matches `09_Offline_Synchronization.md` |
| Backend gaps documented | ✅ Both pending endpoints clearly marked |
| In-IDE compilation | ⚠️ Cannot be performed — Arduino IDE not available in this environment |

---

## What Requires Physical Hardware (Hardware Pending)

| Item | Required Hardware |
|---|---|
| ML8511 ADC readings | ML8511 wired to A0 |
| UV voltage → UV intensity formula validation | ML8511 + calibrated UV source |
| UV intensity → UV Index formula validation | ML8511 + WHO reference |
| OLED display rendering | OLED + I2C wiring |
| Battery voltage measurement | TP4056 + voltage divider circuit |
| Battery percentage accuracy | Full discharge curve measurement |
| TP4056 charging state detection | CHRG pin wired to GPIO |
| A0 pin sharing (ML8511 vs battery) | Multiplexer or scheduling decision |
| I2C address confirmation | Physical I2C scanner on hardware |
| SPIFFS offline queue persistence | Flash filesystem mount |
| Physical GPIO pin validation | Full hardware assembly |
| End-to-end firmware → backend data flow | All hardware + running backend |

---

## Security

| Item | Handling |
|---|---|
| Wi-Fi password | In `firmware_config.h` only. Never logged. Never committed. |
| Device API key | In `firmware_config.h` only. Sent in HTTP headers. Never logged. |
| Device ID | Safe to log (non-secret UUID). |
| Backend URL | Safe to log (non-secret). |

---

## Known Limitations (Phase 5A)

1. **No physical hardware tested.** All sensor, display, and battery values are stubs.
2. **Two backend endpoints missing:** `GET /api/v1/server/time` and `POST /api/v1/device/heartbeat`. Firmware handles gracefully (404 → warn + fallback). Must be implemented before hardware integration testing.
3. **Time without sync:** If both backend and NTP fail, timestamps default to Unix epoch (`1970-01-01T00:00:00Z`). Backend will reject these readings.
4. **Volatile queue:** In-memory queue is lost on power cycle. SPIFFS persistence is hardware-pending.
5. **Arduino IDE path:** `.ino` file uses relative `../` includes. If Arduino IDE cannot resolve these, copy module folders alongside the `.ino` file.
6. **Single ADC pin:** ML8511 and battery monitoring share A0. Conflict resolution is hardware-pending.
7. **In-IDE compilation not verified** in Phase 5A environment.
