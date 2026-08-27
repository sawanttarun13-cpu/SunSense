# Phase 5B — S12SD Bug Fix Report

**Date:** 2026-08-27  
**Phase:** 5B Hardware Integration — Firmware Bug Fix  
**Sensor:** GUVA-S12SD (S12SD)  

---

## 1. Bugs Found, Root Causes, and Fixes

### Bug #1 — Display Shows OFFLINE When Wi-Fi Is Connected

**Root Cause:**  
In `SunSense_Firmware.ino` `loop()`, the display update logic only called `showOffline()` every loop cycle when disconnected, but `showReading()` (which shows ONLINE) was only called inside `takeAndProcessReading()` once every 60 seconds. Between readings, there was no display update for the connected state. If Wi-Fi briefly dropped and reconnected (common with mobile hotspots), the display would show OFFLINE and never correct itself until the next 60-second reading.

**Fix Implemented:**  
Added a throttled display refresh (every 2 seconds) with both ONLINE and OFFLINE branches:

```cpp
if (now - lastDisplayTime >= 2000) {
    lastDisplayTime = now;
    if (!isConnected) {
        display.showOffline(...);
    } else {
        display.showReading(..., true, ...);  // true = ONLINE
    }
}
```

---

### Bug #2 — UV Index Jumps to 30 When Going Outside

**Root Cause:**  
The ADC-to-voltage formula (`Voltage = ADC / 1023.0 x 3.3`) is **correct** for the ESP8266 NodeMCU A0 pin. The UV Index formula (`UVI = Voltage / 0.1`) is **correct** per the GUVA-S12SD datasheet.

The problem was that the S12SD physically cannot output more than ~1.17V (UV Index ~11.7), but the firmware had no saturation detection. When sensor output exceeded the datasheet maximum (due to noise, wiring anomaly, or saturation), the UV Index silently climbed to 30 without any diagnostic warning.

**Fix Implemented:**
- **Saturation detection:** When voltage exceeds `GUVAS12SD_MAX_OUTPUT_V` (1.2V), a `[S12SD SATURATION]` warning is logged with full diagnostics (ADC, voltage, calculated UVI, and possible causes).
- **No arbitrary capping:** The UV Index is NOT capped at 15. The safety clamp at 30 is retained only as an anti-overflow guard.
- **Provisional constants:** All calibration constants are clearly marked as `PROVISIONAL` in `firmware_config.h`.
- **S12SD diagnostic mode:** Each reading cycle logs a clearly identifiable diagnostic block:
  ```
  [S12SD] Raw ADC: 310 | Sensor Voltage: 1.000 V | UV Index: 10.00 | UV Intensity: 0.250 mW/cm2
  ```

---

### Bug #3 — Backend Health Check Fails (HTTP -1)

**Root Cause:**  
HTTP error code `-1` means the TCP connection itself failed. This can be caused by:
1. Backend server not running (`npm run dev` not executed)
2. Backend listening on `localhost` only (not LAN-accessible)
3. Wrong IP address in `BACKEND_BASE_URL`
4. Windows Firewall blocking port 5000
5. ESP8266 and laptop on different network subnets

The `BACKEND_BASE_URL` was also stale (`10.182.234.104`) from a previous network session. It has been updated to the current LAN IP (`10.111.164.104`).

**Fix Implemented:**
- `checkHealth()` now logs full connection context: target URL, WiFi status code, device IP, and RSSI — without exposing any secrets.
- When HTTP -1 is received, a diagnostic checklist is printed to Serial with the 5 most common causes.
- The `BACKEND_BASE_URL` has been updated to match the current LAN IP.

---

### Bug #4 — Time Never Syncs (Epoch 1970 Timestamps)

**Root Cause:**  
In `onReconnect()`, time synchronization was positioned AFTER the backend health check. When the health check failed (Bug #3), the function returned early, and time sync never executed. This left all reading timestamps at `1970-01-01T00:00:00Z`.

Even when the backend was unreachable, NTP (internet time) was available via the mobile hotspot, but the code never reached the NTP fallback path.

**Fix Implemented:**
- Time sync is now the FIRST action in `onReconnect()`, running **independently** of backend health.
- If the backend's `/api/v1/server/time` endpoint is unreachable, the NTP fallback (`pool.ntp.org`) is automatically used.
- The existing server-time API parsing (reading from the `data` envelope) is preserved.
- Backend time re-sync still runs after successful authentication (Step 4), providing higher accuracy when backend is available.

---

### Bug #5 — Readings Rejected by Backend (HTTP 400)

**Root Cause:**  
The firmware was sending `uvIntensity` and `voltageV` fields in the readings JSON payload. The backend's Zod validator (`ReadingsPayloadSchema`) only accepts `{ uvIndex, recordedAt }`. Zod's default strict mode rejects payloads with unknown fields, resulting in HTTP 400.

**Fix Implemented:**
- Removed `uvIntensity` and `voltageV` from the `sendReadings()` JSON payload.
- The firmware now sends only the fields accepted by the backend contract:
  ```json
  { "readings": [{ "uvIndex": 6.50, "recordedAt": "2026-08-27T10:00:00Z" }] }
  ```
- The backend validator and API contract were NOT modified.

---

## 2. Files Changed

| File | Bugs Fixed | Changes |
|------|-----------|---------|
| `firmware_config.h` | #2, #3 | Added PROVISIONAL S12SD calibration constants. Updated `BACKEND_BASE_URL` IP. |
| `GUVAS12SD.cpp` | #2 | Verified ADC formula. Added saturation detection and warning. Added S12SD diagnostic log block. Removed stale "HARDWARE PENDING" messages. |
| `SunSense_Firmware.ino` | #1, #4 | Fixed display loop with 2-second throttle and ONLINE/OFFLINE branches. Moved time sync before backend health check in `onReconnect()`. |
| `ApiClient.cpp` | #3, #5 | Added connection diagnostics to `checkHealth()`. Removed extra payload fields from `sendReadings()`. Added `ESP8266WiFi.h` include. |

**Files NOT modified:** Backend code, database schema, frontend, Display.h, Display.cpp, WiFiManager.cpp, TimeSync.cpp, OfflineQueue.cpp.

---

## 3. Validation Performed

| Check | Result |
|-------|--------|
| Backend TypeScript type check (`npx tsc --noEmit`) | PASS (exit code 0) |
| Backend API contract compatibility | Firmware payload `{uvIndex, recordedAt}` matches `ReadingsPayloadSchema` |
| Secret leak audit (grep for PASSWORD, API_KEY, secret in logs) | No secrets exposed in diagnostic output |
| Firmware code review (all 4 modified files) | Consistent, no syntax errors |

NOTE: Arduino/ESP8266 compilation was NOT performed (requires Arduino IDE or PlatformIO CLI). The user must compile via Arduino IDE to verify.

---

## 4. S12SD Assumptions Still Requiring Physical Verification

| Assumption | Source | Status |
|-----------|--------|--------|
| `GUVAS12SD_VOLTS_PER_UVI = 0.1V` per UV Index | GUVA-S12SD datasheet (typical) | PROVISIONAL |
| `GUVAS12SD_MAX_OUTPUT_V = 1.2V` | Datasheet typical max (~1.17V) | PROVISIONAL |
| `GUVAS12SD_ADC_REF_V = 3.3V` for NodeMCU A0 | NodeMCU schematic (220k/100k divider) | PROVISIONAL |
| Linear relationship between voltage and UV Index | Datasheet characteristic curve | PROVISIONAL |
| 10-sample ADC averaging sufficient for noise reduction | Engineering estimate | PROVISIONAL |

---

## 5. Remaining Hardware Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| A0 shared between S12SD and battery monitoring | Cannot read battery voltage while S12SD is connected | A0 is dedicated to S12SD during this test. Battery monitoring deferred. |
| OLED I2C initialization intermittently fails | Display shows stale content or no content | Monitor during testing. May need I2C stabilization delay. |
| Mobile hotspot IP changes between sessions | `BACKEND_BASE_URL` becomes stale, causing HTTP -1 | Run `ipconfig` and update `firmware_config.h` before each session. |
| S12SD output exceeds 1.2V unexpectedly | Saturation warning fires but UV Index value may be meaningless | Investigate wiring, check for A0 pull-up, verify sensor VCC is 3.3V not 5V. |

---

## 6. Next Recommended Hardware Test

1. **Start the backend** on your laptop: `cd backend && npm run dev`
2. **Verify your laptop's IP** matches `BACKEND_BASE_URL` in `firmware_config.h`
3. **Flash the firmware** via Arduino IDE
4. **Open Serial Monitor** at 115200 baud
5. **Expected boot sequence:**
   - `[SENSOR] GUVA-S12SD initialized on A0 — PROVISIONAL calibration`
   - `[WIFI] Connected!`
   - `[TIME] Synced from NTP — epoch: ...` (or from backend if reachable)
   - `[API] Backend health check: OK (200)`
   - `[S12SD] Raw ADC: xxx | Sensor Voltage: x.xxx V | UV Index: x.xx | UV Intensity: x.xxx mW/cm2`
6. **Test indoors:** UV Index should be 0-2
7. **Test outdoors:** UV Index should match local weather UV forecast (typically 3-10)
8. **Watch for:** `[S12SD SATURATION]` warnings — if these appear, report the full diagnostic line

S12SD calibration is NOT complete. These fixes enable diagnostic data collection. Final calibration requires comparison against a reference UV meter during controlled outdoor testing.

---

## 7. Physical Test Results (2026-08-27)

Phase 5B S12SD hardware integration has successfully passed the first physical end-to-end test.

**Observed Results:**
- Indoor UV Index: ~0.6–0.8
- Outdoor UV Index: ~2.8
- Outdoor S12SD voltage: ~0.277 V
- UV Index dynamically decreases when moving indoors.
- No UV saturation warnings were triggered.
- OLED correctly displays UV Index, Voltage, Queue, and ONLINE status.
- Wi-Fi connected successfully.
- Backend health check, time synchronization, and heartbeat all successful.
- Backend correctly accepted UV readings.
- Offline queue remained empty (Q:0) during connected testing.

**Current Status:**
- Core Integration (S12SD + OLED + Wi-Fi + Backend): **PASSED**
- S12SD Calibration: **PROVISIONAL** (Do not mark as final)
- Battery Monitoring: **DEFERRED** (A0 pin currently dedicated to S12SD)
