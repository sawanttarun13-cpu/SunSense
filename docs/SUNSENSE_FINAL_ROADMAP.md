# SUNSENSE_FINAL_ROADMAP.md

**DO NOT CHANGE THE PHASE ORDER WITHOUT EXPLICIT PROJECT OWNER APPROVAL.**

## IMPORTANT FOR FUTURE AGENTS
1. Read this document (`docs/SUNSENSE_FINAL_ROADMAP.md`) first.
2. Identify the current phase.
3. Do not work on a later phase unless explicitly requested.
4. Do not reorder phases.
5. Do not duplicate completed work.
6. Do not silently modify backend architecture to accommodate firmware.
7. If a discrepancy is found, report it before changing unrelated phases.
8. Preserve the existing frontend/backend/database architecture.
9. Keep firmware modular.
10. Treat this roadmap as the single source of truth.

---

## 1. Complete Phase List & Status

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Frontend Foundation | ✅ COMPLETE |
| Phase 1.5 | Frontend Refactoring | ✅ COMPLETE |
| Phase 2 | Mock Data Architecture & UI States | ✅ COMPLETE |
| Phase 3 | Backend REST API Contract | ✅ COMPLETE |
| Phase 4A | PostgreSQL Installation | ✅ COMPLETE |
| Phase 4B | PostgreSQL Database Initialization | ✅ COMPLETE |
| Phase 4C | Database Validation & Cleanup | ✅ COMPLETE |
| Phase 5A | Firmware Foundation (Hardware-Independent) | ✅ COMPLETE |
| Phase 5A | Backend Integration Gaps | ✅ COMPLETE |
| Phase 5B | Physical Hardware Integration | ✅ COMPLETE (Battery Deferred) |
| Phase 6A-6F | Frontend ↔ Backend API Integration | ✅ COMPLETE |
| **Phase 7** | **Real-time Communication (WebSockets)** | 🔄 **CURRENT / READY TO START** |
| Phase 8 | Production Firmware ↔ Backend Sync | ⏳ PENDING |
| Phase 9 | Backend Analytics | ⏳ PENDING (Partially implemented in 6E) |
| Phase 10 | Alerts | ⏳ PENDING |
| Phase 11 | Full System Testing | ⏳ PENDING |
| Phase 12 | Production Deployment | ⏳ PENDING |

---

## 2. Objective of Every Phase

### ✅ Completed Phases Summary
- **Phase 1 & 1.5:** Built React UI from Figma, extracted components, and created production architecture (hooks, services, utils).
- **Phase 2:** Centralized mock data, implemented UI logic and deterministic history states.
- **Phase 3:** Documented full backend architecture, database schema, and REST API.
- **Phase 4A/B/C:** Installed and validated PostgreSQL database via Prisma, ran initial migrations, and tested health endpoints.
- **Phase 5A & Gaps:** Created modular ESP8266 C++ firmware architecture (Wi-Fi, Queueing, HTTP API requests, Time Sync, Heartbeat). Also implemented two missing backend endpoints (`/api/v1/server/time` and `/api/v1/device/heartbeat`).

### 🔄 CURRENT PHASE: Phase 5B — Physical Hardware Integration
**Objective:** Integrate and test the physical SunSense electronics using the existing Phase 5A firmware architecture.
**Important Dependencies:** Requires ESP8266 NodeMCU CH340, S12SD / GUVA-S12SD UV sensor, 1.3" OLED, Breadboard, Jumper wires, TP4056 module, and Li-Ion Battery.

### ⏳ Future Phases
- **Phase 6:** Hook up React frontend to live backend endpoints instead of mock data.
- **Phase 7:** Implement WebSockets for live dashboard updates without page refreshes.
- **Phase 8:** Advanced firmware optimizations (OTA updates, deep sleep, full production sync).
- **Phase 9:** Backend analytics engine and reporting logic.
- **Phase 10:** Smart Alert triggering logic (burn warnings, daily limits).
- **Phase 11:** Full end-to-end integration testing across frontend, backend, database, and hardware.
- **Phase 12:** Final documentation, deployment, and handover.

---

## 3. Hardware Integration Stage (Phase 5B Checklist)

Phase 5B steps and status:
✅ 1. Verify ESP8266 board and USB/serial communication.
✅ 2. Verify ESP8266 Arduino IDE compilation/upload.
✅ 3. Connect S12SD to ESP8266 on breadboard.
✅ 4. Verify S12SD analog readings (Verified outdoors: ~0.277V).
✅ 5. Implement/verify S12SD voltage conversion.
✅ 6. Implement/verify UV intensity calculation.
✅ 7. Implement/verify UV Index calculation. (Calibration: **PROVISIONAL**)
✅ 8. Connect OLED using I2C. (Fixed with I2C scanner & reset=false)
✅ 9. Display UV intensity and UV Index locally on OLED.
✅ 10. Verify Wi-Fi connection.
✅ 11. Verify device authentication against the SunSense backend.
✅ 12. Verify UV reading upload to `POST /api/v1/readings`.
✅ 13. Verify server time synchronization.
✅ 14. Verify heartbeat communication.
⏸️ 15. Verify battery monitoring. (**DEFERRED** — requires external hardware solution for shared A0 pin)

**Next: Phase 5B.4 — Stabilization & Validation**
⏳ 16. Repeated indoor/outdoor sensor testing.
⏳ 17. OLED verification over extended runtimes.
⏳ 18. Backend reading verification (database persistence check).
⏳ 19. Wi-Fi disconnect test.
⏳ 20. Offline queue test.
⏳ 21. Wi-Fi reconnection and queue flush test.
⏳ 22. Timestamp verification (ensure offline timestamps are queued properly).
⏳ 23. Validate the complete physical data flow.

**Phase 5B Safety Rule:**
* DO NOT provide permanent soldering instructions yet.
* First use the breadboard for all electrical validation.
* Before giving exact wiring instructions, inspect/confirm the actual pin labels of: S12SD board, OLED board, TP4056 board, ESP8266 NodeMCU.
* Battery/power connections must be handled separately and carefully. Do not assume an arbitrary power connection.

---

## 4. Architecture Rules

### Data Flow & UV Index Responsibility
The **ESP8266** performs the following locally:
`S12SD` → `ESP8266 A0` → `Local UV processing` → `UV Intensity + UV Index` → `OLED`

When Wi-Fi is available:
`ESP8266` → `SunSense Backend API` → `PostgreSQL` → `React Dashboard`

**CRITICAL:** The backend must **NOT** be responsible for calculating the UV Index from the raw sensor ADC value.

### Important API Contracts
- `POST /api/v1/readings`: Expects an array of `{ uvIndex, recordedAt }`.
- `POST /api/v1/device/authenticate`: Uses `x-device-id` and `x-api-key` headers.
- `POST /api/v1/device/heartbeat`: Receives battery, RSSI, and uptime status.
- `GET /api/v1/server/time`: Returns `unixTimestamp` and ISO `utcTime`.

---

## 5. Known Deferred Items
- A0 is currently dedicated to S12SD UV measurement.
- Battery monitoring via A0 is deferred until a safe hardware solution is confirmed.
- Permanent soldering guides are deferred until breadboard validation is complete.
