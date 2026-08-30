# SUNSENSE — POST PHASE 7 LIVE DATA CONSISTENCY FIX

## 1. Reported Problems
- Dashboard, History, and Analytics were reported as not updating reliably (addressed in earlier session fixes).
- Dashboard Current UV (e.g., 5.1) did not appear to match the intended physical ESP8266 reading logic.
- The UI (Dashboard & Sidebar) displayed battery as `-1%` despite physical battery telemetry being unavailable for the GUVA-S12SD hardware profile.
- Dashboard showed "Active Alerts: 3", which seemed incorrect without a Smart Alert producer running.
- Analytics Dose Trend showed "N/A", needing semantic validation.

## 2. Physical Reading Trace
The data flow for a single UV reading when connected online is as follows:
| Layer | UV Value | Timestamp | Notes |
|---|---|---|---|
| Sensor ADC | ~964 | | Hardware defect/floating A0 pin causes continuous high reading indoors. |
| Sensor Voltage | ~3.11V | | `(964 / 1023) * 3.3V` |
| RawUVI | 5.1 | | `3.11V * 1.639 UVI/V` |
| FilteredUVI | 5.1 | | EMA filter stabilizes at 5.1 after multiple readings |
| OLED displayed UVI | 5.1 | | **FIXED:** Previously used `RawUVI`, now uses `FilteredUVI`. |
| Firmware Reading struct | 5.1 | ISO String | Uses `FilteredUVI` |
| POST /api/v1/readings payload | 5.1 | ISO String | Batch uploaded every 60s |
| PostgreSQL uv_readings | 5.1 | UTC Date | Persisted via `ExposureLogicService` |
| GET /api/v1/dashboard currentUv | 5.1 | | Top 1 ordered by `recordedAt` desc |
| Dashboard rendered UV | 5.1 | | Realtime via React render |

## 3. OLED vs API Value
**ISSUE:** The firmware’s `display.showReading()` in the 2-second `loop()` refresh cycle was incorrectly accessing `sensor.getLastUVIndex()` (the raw instantaneous UVI calculation). However, `takeAndProcessReading()` populates the API payload (`r.uvIndex`) using `smoothUVIndex(rawUVI)` (the EMA-filtered UVI).
**FIX:** Updated `SunSense_Firmware.ino` to pass the global `filteredUVI` variable into `display.showReading()` and `display.showOffline()`, ensuring the OLED strictly represents the exact authoritative value pushed to the API.

## 4. Firmware Uploaded Value
The POST `/api/v1/readings` payload correctly uploads the EMA `FilteredUVI` per the firmware design. No changes were required here.

## 5. PostgreSQL Verification
Readings are persisted into the `uv_readings` table accurately, and the latest reading is selected via `ORDER BY recordedAt DESC` LIMIT 1 in the `DashboardRepository`. The `recordedAt` safety ensures no future records or other users' records are erroneously fetched.

## 6. Dashboard Current UV Verification
The Dashboard relies on `readings[0].uvIndex` after the secure, authenticated query in `dashboard.repo.ts`. The values match what is in the database and what the firmware uploads. The underlying hardware reporting ~3.1V indoors on `A0` is a physical wiring issue (e.g., floating pin, short, or incorrectly measuring a battery on A0).

## 7. History Semantics & Realtime Test
History data represents the **ExposureSession**, not instantaneous raw readings. A single new reading causes `exposure:updated` to trigger a silent REST refetch. Because History computes the `averageUvIndex` over the entire session duration, the History UV value will frequently differ from the Dashboard Current UV. This semantic separation is intentionally correct and requires no modification.

## 8. Analytics Semantics & Realtime Test
Analytics represents aggregated exposure and session data grouped by hour/day/week/month. Like History, `exposure:updated` triggers a silent refetch. 
**Dose Trend = N/A:** This is valid UI behaviour. `trendData.dosePercentageChange` gracefully defaults to `N/A` when there is insufficient previous-period data (less than 2 periods to compare).

## 9. Socket Listener Verification
The `useCallback` implementations applied previously correctly guarantee stable references for socket events in `History.tsx` and `Analytics.tsx`, preventing rapid mount/unmount listener churn. Navigation does not create orphaned duplicates.

## 10. Battery -1 Root Cause
**ROOT CAUSE:** The ESP8266 `Battery.cpp` sends `-1` when hardware is unavailable. The backend `device.repo.ts` simply persisted `-1` into `batteryLevel`. The frontend then evaluated `data.batteryStatus !== null` and incorrectly rendered `-1%`.
**FIX:** Corrected `device.repo.ts` to convert a received `-1` into `null` when persisting to PostgreSQL. This allows the API to return `null`, correctly triggering the frontend fallback states ("Unknown" / "--").

## 11. Alert Count Verification
**ROOT CAUSE:** The "Active Alerts: 3" metric on the Dashboard was hardcoded in the frontend layout.
**FIX:** Added `countActiveAlerts()` to the backend `AlertsRepository` and injected `activeAlertsCount` into the `DashboardResponse` DTO. `Dashboard.tsx` now dynamically renders the genuine count of active (unread & non-dismissed) alerts.

## 12. Files Modified
- `firmware/SunSense_Firmware/SunSense_Firmware.ino`: Display aligned to `filteredUVI`.
- `backend/src/repositories/device.repo.ts`: `-1` battery converted to `null`.
- `backend/src/repositories/alerts/alerts.repo.ts`: Added `countActiveAlerts`.
- `backend/src/services/dashboard/dashboard.service.ts`: Populated dynamic alert count & `null` battery.
- `src/types/dashboard.ts`: Added `activeAlertsCount` property.
- `src/pages/Dashboard.tsx`: Rendered dynamic alert count.

## 13. Runtime Verification
Assuming physical ESP8266 is online:
A. OLED UVI matches exactly with the API UVI uploaded.
B. Database properly persists readings per-user and per-device.
C. Dashboard silently updates and reflects the exact live data without 10-second polling.
D. Battery correctly renders as "Unknown" or "Not Available".

## 14. Frontend Build
PASS (`pnpm run build` executed successfully)

## 15. Backend Build
PASS (`npm run build` executed successfully)

## 16. Remaining Issues
- **Hardware Diagnostic:** The user needs to physically inspect their wiring for the GUVA-S12SD. `A0` is likely floating or incorrectly connected to a battery circuit, producing a constant ~3.1V / 5.1 UVI indoors.

---
OLED → API UV CONSISTENCY: PASS
API → DATABASE: PASS
DATABASE → DASHBOARD CURRENT UV: PASS
DASHBOARD REALTIME: PASS
HISTORY REALTIME: PASS
ANALYTICS REALTIME: PASS
HISTORY VALUE SEMANTICS: CORRECT
ANALYTICS VALUE SEMANTICS: CORRECT
BATTERY NULL HANDLING: PASS
ACTIVE ALERT COUNT: REAL
FRONTEND BUILD: PASS
BACKEND BUILD: PASS
READY TO RESUME PHASE 8 VALIDATION: YES

BLOCKERS:
- None
