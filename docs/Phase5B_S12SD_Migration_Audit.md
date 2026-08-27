# Phase 5B — S12SD Sensor Migration Audit

## 1. Migration Status
**Incomplete.** While the core firmware driver has been successfully replaced (`GUVAS12SD.cpp`), extensive references to the `ML8511` sensor remain throughout the project's documentation, backend comments, frontend UI/mock data, and the `Battery` firmware module. The architecture roadmap and safety constraints regarding the `A0` pin share must be explicitly redesigned, as the `S12SD` lacks the enable (`EN`) pin previously relied upon for the `ML8511`.

## 2. Files Already Updated
The following firmware files correctly implement or reference the `S12SD` (GUVA-S12SD):
- `firmware/SunSense_Firmware/SunSense_Firmware.ino` (Includes header and instantiates `sensor`)
- `firmware/SunSense_Firmware/src/sensors/GUVAS12SD/GUVAS12SD.h` (Driver definition)
- `firmware/SunSense_Firmware/src/sensors/GUVAS12SD/GUVAS12SD.cpp` (Driver implementation)
- `firmware/SunSense_Firmware/src/config/firmware_config.h` (Defines `GUVAS12SD_OUT_PIN` and `GUVAS12SD_VOLTS_PER_UVI`)

## 3. Files Still Using ML8511
The following files still contain `ML8511` references and require updates:

### Documentation
- `docs/SUNSENSE_FINAL_ROADMAP.md` (Multiple sections regarding wiring, diagrams, and dependencies) -> **REQUIRED CHANGE:** Update all `ML8511` mentions to `S12SD/GUVA-S12SD`.
- `Final_Roadmap.md` (Dependencies) -> **REQUIRED CHANGE:** Change to S12SD.
- `docs/backend/01_System_Architecture.md` (Diagrams and flow) -> **REQUIRED CHANGE:** Change to S12SD.
- `docs/backend/12_Implementation_Roadmap.md` -> **REQUIRED CHANGE:** Change to S12SD.
- `SunSense_Master_Project_Reference.md` -> **REQUIRED CHANGE:** Change to S12SD.
- `SunSense_Project_Charter_Rules_Phase_Roadmap_v2 (1).md` -> **REQUIRED CHANGE:** Change to S12SD.
- `firmware/README.md` (Tables, architecture, A0 conflicts) -> **REQUIRED CHANGE:** Rewrite to reflect S12SD and the lack of an `EN` pin.

### Frontend
- `src/types/device.ts` (Line 38: `ml8511: { ok: boolean; val: string }`) -> **REQUIRED CHANGE:** Rename key to `s12sd`.
- `src/mockData/device.ts` (Line 38) -> **REQUIRED CHANGE:** Rename key to `s12sd`.
- `src/pages/Device.tsx` (Line 264: `<SensorRow name="UV Sensor (ML8511)" ... />`) -> **REQUIRED CHANGE:** Update UI label and object keys.

### Backend (Comments Only)
- `backend/prisma/schema.prisma` (Line 187) -> **REQUIRED CHANGE:** Update docstring.
- `backend/src/services/calculation/calculation.service.ts` -> **REQUIRED CHANGE:** Update docstring.
- `backend/src/services/ingestion/device-ingestion.service.ts` -> **REQUIRED CHANGE:** Update docstring.
- `backend/src/repositories/reading/reading.repo.ts` -> **REQUIRED CHANGE:** Update docstring.

### Firmware (Comments and Architecture)
- `firmware/SunSense_Firmware/src/utils/Logger.h` -> **REQUIRED CHANGE:** Update docstring.
- `firmware/SunSense_Firmware/src/models/Reading.h` -> **REQUIRED CHANGE:** Update docstring.
- `firmware/SunSense_Firmware/src/config/firmware_config.h` (Lines 89, 143) -> **REQUIRED CHANGE:** Update docstring regarding `BATTERY_ADC_PIN`.
- `firmware/SunSense_Firmware/src/battery/Battery.h` -> **REQUIRED CHANGE:** Remove "Option C: Read battery only when ML8511 EN pin is LOW".
- `firmware/SunSense_Firmware/src/battery/Battery.cpp` -> **REQUIRED CHANGE:** Remove comments instructing the use of `ml8511.disable()`.

## 4. Firmware Audit
- **Sensor Abstraction:** Completely migrated to `GUVAS12SD`.
- **ADC Pin:** Correctly assigned to `A0`.
- **GPIO/Control Pins:** The driver correctly recognizes that the `S12SD` has no `EN` pin.
- **Voltage Assumptions:** Correctly assumes 3.3V reference for 10-bit ADC.
- **Conversion Logic:** Standard `voltage = (ADC / 1023.0) * 3.3`.
- **Calibration Logic:** Currently clamped between 0.0 and 30.0 UVI.
- **UV Intensity Calculation:** Uses WHO standard `uvIndex * 0.025f`.
- **UV Index Calculation:** Uses standard GUVA formula `voltage / 0.1f`.

## 5. Hardware Safety Audit
- **A0 Usage:** Both the sensor and the battery monitor are currently configured to use `A0`.
- **Battery Conflict:** The `Battery.cpp` module previously assumed it could turn off the `ML8511` using the `EN` pin to safely read the battery on `A0`. **The `S12SD` has no `EN` pin and is constantly outputting voltage.**
- **Voltage/Power Concerns (CRITICAL DANGER):** Connecting a Li-Ion battery (up to 4.2V) directly to `A0` alongside an active `S12SD` (outputting up to 3.3V) without an external multiplexer or isolated voltage divider will result in hardware damage and cross-contamination of electrical signals. A hardware multiplexer (like a CD4051) or a different ESP32-based architecture with multiple ADCs is strictly required.

## 6. Documentation Audit
Every major architectural document, including the `README.md`, `SUNSENSE_FINAL_ROADMAP.md`, `01_System_Architecture.md`, and the `SunSense_Master_Project_Reference.md` contains stale `ML8511` references. Specifically, the firmware `README.md` and `Battery` class documentation outline a time-division multiplexing approach (toggling `EN`) that is physically impossible with the `S12SD`.

## 7. Roadmap Audit
The project roadmaps (`SUNSENSE_FINAL_ROADMAP.md`, `Final_Roadmap.md`) incorrectly identify the `ML8511` as the active UV sensor. Phase 5B does not describe the specific integration pipeline for the `S12SD`.

## 8. API/Backend Compatibility
**Compatible.** The sensor migration does not affect the existing API contract. The API schema strictly requires `uvIndex`, `uvIntensity`, `voltageV`, and `recordedAt`. It is agnostic to the hardware that produced those values. No code changes are required for the backend API logic.

## 9. Unknowns Requiring Verification
- **NEEDS HARDWARE/DATASHEET VERIFICATION:** The exact manufacturer of the physical `S12SD` module in use. Some generic boards possess incorrect op-amp gain resistors resulting in rapid saturation (ADC 1024) in sunlight.
- **NEEDS HARDWARE/DATASHEET VERIFICATION:** Whether an analog multiplexer will be introduced to safely share `A0` between the `S12SD` and the battery, or if battery monitoring will be dropped/handled via an external I2C ADC (e.g., ADS1115).

## 10. Recommended Changes

### MUST CHANGE
- Update all roadmaps, `README.md` files, and architecture diagrams from `ML8511` to `S12SD`.
- Update the Frontend React application (`Device.tsx`, `device.ts`) to use `s12sd` keys and labels.
- Remove all comments in `Battery.cpp` and `Battery.h` suggesting the sensor can be disabled via an `EN` pin.

### SHOULD CHANGE
- Update docstrings and comments across the backend services and Prisma schema to remove `ML8511` mentions for long-term clarity.

### NO CHANGE REQUIRED
- Backend API endpoints, controllers, request validators, and database schemas.
- Firmware JSON serialization payload structure.

### HARDWARE VERIFICATION REQUIRED
- Resolution for the `A0` pin sharing conflict (Battery vs. S12SD).
- Physical verification of the `S12SD` module's calibration curve and op-amp behavior.

## 11. Final Certification

**NOT READY — ISSUES REMAIN**
(Readiness requires finalizing the documentation, updating the frontend, and explicitly defining the hardware solution for the `A0` pin conflict, as the `S12SD` cannot be disabled in software to allow battery readings.)
