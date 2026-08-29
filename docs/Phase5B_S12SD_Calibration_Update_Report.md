# Phase 5B — S12SD Calibration Update Report

## Overview

This report documents the GUVA-S12SD sensor calibration update performed
as part of Phase 5B. The firmware has been updated to reflect the actual
hardware configuration: a **1 MΩ first-stage feedback resistor** on the
CJMCU-GUVA-S12SD module, with the second amplifier stage still active.

---

## Files Changed

| File | Status | Description |
|------|--------|-------------|
| `firmware/SunSense_Firmware/src/config/firmware_config.h` | **MODIFIED** | New calibration constants, saturation detection, corrected UV intensity |
| `firmware/SunSense_Firmware/src/sensors/GUVAS12SD/GUVAS12SD.h` | **MODIFIED** | Added `isSaturated()`, `_saturated` member, `explicit` constructor |
| `firmware/SunSense_Firmware/src/sensors/GUVAS12SD/GUVAS12SD.cpp` | **MODIFIED** | New UVI formula, saturation detection, calibration pipeline |
| `firmware/SunSense_Firmware/SunSense_Firmware.ino` | **MODIFIED** | EMA smoothing, saturation in diagnostics/heartbeat |

### Unchanged Modules (verified intact)

- `src/api/ApiClient.h/.cpp` — API communication
- `src/connectivity/WiFiManager.h/.cpp` — Wi-Fi management
- `src/display/Display.h/.cpp` — OLED display
- `src/battery/Battery.h/.cpp` — Battery monitoring
- `src/time/TimeSync.h/.cpp` — Time synchronization
- `src/storage/OfflineQueue.h/.cpp` — Offline queue
- `src/models/Reading.h` — Reading struct
- `src/utils/Logger.h` — Serial logger

---

## UVI Formula Change

### OLD Formula (Phase 5A — assumed 10 MΩ feedback)

```
UVI = VOUT / 0.1
UVI = VOUT × 10
```

| Voltage | Old UVI |
|---------|---------|
| 0.019 V | 0.19 |
| 0.052 V | 0.52 |
| 0.903 V | 9.03 |
| 3.300 V | 33.0 (clamped to 15) |

### NEW Formula (Phase 5B — confirmed 1 MΩ feedback)

```
UVI = VOUT × (10 / 6.1)
UVI ≈ VOUT × 1.639
```

| Voltage | New UVI |
|---------|---------|
| 0.019 V | ~0.03 |
| 0.052 V | ~0.09 |
| 0.903 V | ~1.48 |
| 3.200 V | ~5.24 (saturated) |

The 1.639 factor is derived from the documented 6.1× second-stage
amplifier gain for this module configuration.

---

## UV Intensity Correction

### OLD (incorrect)

```
1 UVI = 0.025 mW/cm²  ← OFF BY 10×
```

### NEW (correct)

```
1 UVI = 25 mW/m² = 0.0025 mW/cm²
```

This is the EPA-defined erythemally weighted UV intensity represented
by the UV Index. It is NOT raw optical power from the photodiode.

---

## Hardware Assumptions (ALL PROVISIONAL)

| Parameter | Value | Status |
|-----------|-------|--------|
| Feedback resistor | 1 MΩ (marking: 01E) | PROVISIONAL — visually identified |
| Second amplifier stage | Enabled (~6.1× gain) | PROVISIONAL — assumed from module design |
| UVI/V conversion factor | 1.639 | PROVISIONAL — not calibrated against reference |
| ADC reference | 3.30 V at A0 | PROVISIONAL — validated by prior saturation reading |
| ADC resolution | 0–1023 | Standard ESP8266 NodeMCU behavior |
| Saturation ADC threshold | 1000 | PROVISIONAL |
| Saturation voltage threshold | 3.20 V | PROVISIONAL |
| Calibration gain | 1.000 (neutral) | Adjustable after reference comparison |
| Calibration offset (V) | 0.000 | Adjustable after reference comparison |
| Calibration offset (UVI) | 0.000 | Adjustable after reference comparison |

---

## Sensor Filtering

| Parameter | Old Value | New Value |
|-----------|-----------|-----------|
| ADC samples per reading | 32 | 64 |
| Sample spacing | 3 ms | 3 ms |
| Total sampling time | ~96 ms | ~192 ms |
| EMA smoothing | None | α = 0.20 |

The 64-sample averaging and 3 ms spacing are acceptable for hardware
testing provided ESP8266 remains responsive and Wi-Fi remains stable.

---

## Saturation Detection

Saturation is detected when **either**:
- Raw ADC ≥ 1000
- Calculated voltage ≥ 3.20 V

When saturated:
- `isSaturated()` returns `true`
- Raw ADC is preserved
- Measured voltage is preserved
- UVI is calculated from the saturation voltage (defensible maximum)
- Diagnostic log prints `SATURATED` instead of `OK`
- Heartbeat reports `sensorHealth = "SATURATED"`

**Important**: A0 reaching ~3.3 V is still a diagnostic condition even
after changing the UVI conversion factor.

---

## Diagnostic Logging

Every reading cycle prints:

```
[S12SD] ADC=<raw> | V=<voltage>V | RawUVI=<before_filter> | FilteredUVI=<after_filter> | UV=<intensity> mW/cm2 | <OK|SATURATED>
```

Additionally, the sensor module itself prints during `readUVIndex()`:

```
[S12SD] ADC=<raw> | V=<voltage>V | UVI=<uvIndex> | UV=<intensity> mW/cm2 | <OK|SATURATED>
```

---

## Reading Interval

- **Current**: 10 seconds
- **Status**: HARDWARE TEST MODE
- **Final production interval**: TBD after physical validation

---

## Compilation Status

> **PENDING**: Compilation requires Arduino IDE with ESP8266 core.
> Cannot be verified in this environment.
>
> The code follows the same structure as Phase 5A which compiled
> and ran successfully. All function signatures and module interfaces
> are preserved.

---

## Physical Testing Status

| Test | Status |
|------|--------|
| Indoor (low UV) | PENDING |
| Sunlight (high UV) | PENDING |
| Saturation detection | PENDING |
| Serial Monitor capture | PENDING |

### Expected Indoor Behavior

- Low ADC values
- Low voltage
- Low UVI (~0.0–0.5)
- No saturation
- Status: OK

### Expected Sunlight Behavior

- ADC increases proportionally
- Voltage increases
- UVI increases (realistic values with 1.639 factor)
- Saturation explicitly reported if A0 reaches threshold

---

## Remaining Calibration Work

1. **Physical validation** — Compare firmware UVI against a trusted
   UV Index reference meter
2. **Adjust `CALIBRATION_GAIN`** — If sensor reads X but reference
   says Y, set gain = Y/X
3. **Validate saturation thresholds** — Confirm ADC=1000 / V=3.20
   are appropriate cutoffs
4. **Confirm 1 MΩ resistor** — Verify the 01E marking definitively
   identifies a 1 MΩ resistor
5. **Confirm second-stage gain** — The 6.1× factor is from module
   documentation; physical measurement may differ
6. **Production reading interval** — 10s is for testing only

---

## Remaining Hardware Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Resistor identification may be wrong | UVI factor would be incorrect | Physical measurement with multimeter |
| Second-stage gain may differ from 6.1 | UVI factor would be incorrect | Calibrate against reference meter |
| ADC reference may drift | Voltage readings would shift | Re-validate with known voltage source |
| 64 samples × 3 ms may affect Wi-Fi | Connectivity drops during sampling | `yield()` called after each sample |
| Battery ADC not available | No battery percentage | Requires separate ADC (not in this phase) |

---

## What Was NOT Changed

- ❌ Backend API
- ❌ PostgreSQL schema
- ❌ Frontend React app
- ❌ Battery hardware/ADC
- ❌ Any other firmware module (WiFi, API, Queue, Display, Time)
