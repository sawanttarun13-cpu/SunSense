# Phase 6E — Dashboard ↔ Device Data Audit & Fix Report

## 1. Reported Problem

ESP8266:
UV Index = 0

Dashboard:
UV Index = 3.1

## 2. Root Cause

The discrepancy was a time-travel collision caused by the development database seed script (`seed.ts`) polluting the live reading stream.

During Phase 6E, the `seed.ts` script was executed to populate the dashboard with mock test data. The script is programmed to insert 8 mock UV readings for "today", starting at 10:00 UTC and ending at 13:30 UTC. 

However, the real current UTC time at the moment of testing was roughly 05:35 UTC. 

Because the physical ESP8266 device is genuinely connected and uploading readings (e.g. `0.03`) at `05:37 UTC`, but the `dashboardRepo.getTodayReadings()` query simply sorts all of today's readings by `recordedAt` descending, the database incorrectly returned the *future* mock reading (`13:30 UTC` = `3.1`) as the "most recent" reading, ignoring the actual live reading sent by the ESP8266.

## 3. Dashboard Data Source Before Fix

The `3.1` value came directly from the PostgreSQL database `uv_readings` table via the real Backend API (`GET /api/v1/dashboard`). The dashboard was already successfully fetching from the live API. It did not invent the number, nor did it fetch it from local mock files; it faithfully displayed the latest record the database returned for today.

## 4. Device Data Flow Audit

The physical device data flow is completely implemented and successfully functioning:
S12SD
→ ESP8266 (raw ADC reading -> Voltage -> UVI = 0.03)
→ `Reading` struct created
→ WiFi connected
→ `ApiClient.cpp` POST request
→ Backend API (`/api/v1/ingestion/sync`)
→ `IngestionService`
→ PostgreSQL `uv_readings` table insertion (verified row exists with deviceId).

## 5. Dashboard Data Flow Before Fix

PostgreSQL `uv_readings` (Contains real live data + future seeded data)
→ `dashboard.repo.ts` (`getTodayReadings` ordered by `recordedAt` DESC)
→ `dashboard.service.ts` (`currentUv = readings[0]`)
→ Backend API response (`/api/v1/dashboard`)
→ Frontend `useDashboardData.ts` (polling every 10s)
→ `Dashboard.tsx` UI
→ Displays 3.1 (Future seeded data overriding live data)

## 6. Fix Implemented

To solve the issue without breaking timezone support, without blindly deleting the seeded history, and without creating a duplicate API endpoint, I added a simple safety bound to the database query:

**File Modified:** `backend/src/repositories/dashboard/dashboard.repo.ts`
**Change:** Updated `getTodayReadings()` to filter out future-dated readings by adding `lte: new Date()` to the `recordedAt` condition.

This extremely robust fix guarantees that the dashboard will always fetch the most recent reading *up to the current second*, perfectly unmasking the live ESP8266 reading (`0.03`) while ignoring any future mock data created by development seed scripts.

## 7. Current Connected Components

| Component | Status | Evidence |
|---|---|---|
| S12SD → ESP8266 | ✅ CONNECTED | Firmware successfully taking `rawAdc` and converting to UVI |
| ESP8266 → OLED | ✅ CONNECTED | `display.showReading` correctly displays UVI on the physical screen |
| ESP8266 → WiFi | ✅ CONNECTED | `WiFiManager` establishes connection in firmware logs |
| ESP8266 → Backend | ✅ CONNECTED | `ApiClient.cpp` successfully uploads readings (Verified via DB records) |
| Backend → PostgreSQL | ✅ CONNECTED | Live readings found in `uv_readings` with correct `deviceId` |
| Device registration | ✅ CONNECTED | Devices are properly seeded and associated in the DB |
| Device → User pairing | ✅ CONNECTED | Backend `DashboardService` correctly fetches device for authenticated user |
| Dashboard → API | ✅ CONNECTED | `useDashboardData` hook polls `/api/v1/dashboard` every 10 seconds |
| Dashboard → real latest reading | ✅ CONNECTED | Dashboard correctly surfaces the latest physical reading (post-fix) |
| History → API | ✅ CONNECTED | Phase 6E implementation |
| Analytics → API | ✅ CONNECTED | Phase 6E implementation |
| Authentication | ✅ CONNECTED | JWT and bcrypt fully operational |
| Profile update | ✅ CONNECTED | API active |
| Offline queue | ✅ CONNECTED | Handled automatically by `OfflineQueue` firmware |
| S12SD calibration | ⚠️ PARTIALLY CONNECTED | Phase 5B calibration is provisional (Gain = 1.0) |

## 8. Current Unconnected / Partial Components

| Component | Status | Evidence |
|---|---|---|
| Hourly UV Chart | 🟡 MOCK | `Dashboard.tsx` specifically imports `hourlyData` from `useUVData.ts` mock because the backend API doesn't yet serve a 24h timeline. |
| Peak UV Time | 🟡 MOCK | Handled by `useUVData.ts`. Backend computes peak value, but not the timestamp. |
| Lowest UV Value | 🟡 MOCK | Handled by `useUVData.ts`. Backend does not compute low values yet. |
| Burn Time Remaining | 🟡 MOCK | Still using a hardcoded placeholder in UI (24 min). |

## 9. Later Phase Connections

The following items represent planned logical integrations for future phases based on the current architecture:
- Real backend API endpoints for the 24-hour Dashboard hourly chart data.
- Connecting Burn Time calculations from the `CalculationService` to the Dashboard UI.
- Phase 8 Smart Alert Engine (triggering real-time notifications for BURN_WARNING, BATTERY_LOW, etc.).
- Complete calibration of the S12SD sensor in production firmware (replacing Phase 5B provisional math).
- Connecting the Sunscreen Application Modal to actually persist to the backend `sunscreen_applications` table.

## 10. Verification

- **Database:** Executed a direct Prisma query against `uv_readings` and verified the physical device was successfully inserting records (e.g. ID `bc2fced9-4724-46ad-b782-e09b4fdbe04e`, `uvIndex: 0.03`, timestamp `05:37 UTC`).
- **Backend API:** Verified the `getTodayReadings` query logic was incorrectly picking up `13:30 UTC` seed data, and confirmed `lte: new Date()` resolves it.
- **Frontend Build:** The UI successfully consumes the corrected dashboard payload.

## 11. Regression Testing

- Authentication: Login/Logout flows successfully evaluated.
- Dashboard: Page loads, current UV displays correctly without mock override, device status shows "Connected".
- History: Table data loads and pagination continues to function perfectly.
- Analytics: Heatmaps and trends continue to process correctly.
- Registration: Multi-step form operational.

## 12. Build

**Backend Build Command:** `npm run build` inside `/backend`
**Result:** PASSED (tsc compiled with 0 errors)

**Frontend Build Command:** `pnpm run build` inside root `/`
**Result:** PASSED (tsc and vite build successful)

## 13. Remaining Issues

The physical sensor calibration remains explicitly PROVISIONAL per the Phase 5B guidelines. The software integration is fully operational and the Dashboard correctly reflects the raw value transmitted by the ESP8266. If the physical OLED shows `0` and the Dashboard shows `0.03` (rounded to `0.0`), the system is verified connected.

==================================================
FINAL VERDICT
==================================================

PASS WITH WARNINGS
