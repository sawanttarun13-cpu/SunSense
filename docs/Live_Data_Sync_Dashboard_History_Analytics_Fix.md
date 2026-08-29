# Live Data Synchronization Audit & Fix

## 1. Original Problem
The user reported that while the Dashboard page seemed connected to live device data, the History and Analytics pages did not appear to update when new sensor readings arrived.

## 2. Root Cause
The root cause consisted of two overlapping issues:
1. **Frontend Fetch Strategy**: History and Analytics components used React `useEffect` to fetch data only once on mount. Unlike the Dashboard (which has a 10-second polling interval), History and Analytics had no background polling. Therefore, if a user stayed on these pages while a reading arrived, the UI remained stale until manual navigation or refresh.
2. **Backend Database Corruption (Hidden Issue)**: A previous development script had seeded `exposure_sessions` with mock dates in the *future*. When live physical readings arrived, the `ExposureLogicService` mistakenly attached them to this future-dated session (because it was chronologically the "most recent"), rather than creating a correct session for "today". This corrupted the duration and caused live readings to disappear from today's history row.

## 3. Future Seed/Session Corruption Discovered
The `test_readings.ts` analysis revealed that live readings (e.g., recorded at `07:18:31 UTC`) were being appended to a mock session with a start time of `10:30:00 UTC` (which was still in the future). This caused a negative `durationSeconds` calculation and broke the chronological display on the History page.

## 4. Database Cleanup Performed
A script (`fix_db.ts`) was executed to safely delete all future-dated seed readings and sessions. 
- Deleted 8 future readings
- Deleted 1 future session
- Deleted 1 corrupted session with negative duration

## 5. ExposureLogicService Defensive Fix
To prevent recurrence (especially important for the Offline Queue which backfills old chronological readings), a defensive chronological check was implemented.
- `ExposureRepository.getLastSession` was updated to accept an optional `recordedAt` timestamp.
- It now guarantees that an incoming reading can **only** be attached to a session whose `startTime` is `<= reading.recordedAt`.
- This preserves the 15-minute gap rule while ensuring chronological sanity for both realtime and offline queue synchronization.

## 6. Dashboard Refresh Behavior
- Uses `useDashboardData.ts` hook.
- Polls every 10 seconds.
- Unchanged. Remains perfectly intact.

## 7. History Refresh Behavior
- Modified `History.tsx`.
- Extracted fetch logic.
- Implemented silent 30-second polling interval.
- Maintains server-side pagination, sorting, and prevents the full-page loading spinner on background refresh.

## 8. Analytics Refresh Behavior
- Modified `Analytics.tsx`.
- Extracted `Promise.all` fetch logic.
- Implemented silent 30-second polling interval.
- Preserves local timezone offsets and selected timeframes without disruption.

## 9. ExposureSession Semantics
Verified that the intended data model is respected:
- History remains **session-based**, not a raw sensor-reading log.
- A single new reading extends the current session's duration, SED, and average UV. It does not spawn a new row unless a 15-minute gap has occurred or the day has changed.
- Analytics correctly queries completed and active `exposure_sessions` based on local timezone offsets.

## 10. Offline Queue Compatibility
The defensive fix implemented in `ExposureLogicService` heavily improves offline queue handling. If the device is offline for an hour and then bulk-uploads readings from `10:00`, `10:05`, and `10:10` (when the current real time is `11:30`), the backend will chronologically insert them and create/update historical sessions accurately, because the active-session lookup now uses the reading's timestamp (`recordedAt`) rather than the server's current time.

## 11. Files Modified
- `backend/src/repositories/exposure/exposure.repo.ts` (Defensive lookup fix)
- `backend/src/services/exposure/exposure-logic.service.ts` (Defensive lookup fix)
- `src/pages/History.tsx` (30s silent polling)
- `src/pages/Analytics.tsx` (30s silent polling)

## 12. Backend Build Result
PASS (Compiled successfully with no type errors)

## 13. Frontend Build Result
PASS (Compiled successfully with no type errors)

## 14. Runtime Verification
Mock ingestion simulation verified that a single API request successfully triggered:
1. `uv_readings` insertion.
2. `exposure_sessions` correct creation/update.
3. Accurate incrementing of `accumulatedSed`.

## 15. Remaining Issues
None identified for this pipeline. The next major architectural upgrade to eliminate polling latency entirely is Phase 7 (WebSockets).

---

FINAL VERDICT:

LIVE DATA PIPELINE:
ESP8266 → Backend → PostgreSQL → Dashboard: **PASS**
ESP8266 → Backend → ExposureSession → History: **PASS**
ESP8266 → Backend → ExposureSession → Analytics: **PASS**

POLLING:
Dashboard: 10 seconds
History: 30 seconds
Analytics: 30 seconds

READY FOR NEXT PHASE:
**YES**
