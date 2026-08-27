# Phase 5B.4 — Stabilization & Validation Checklist

This phase ensures the core S12SD hardware integration is stable over extended periods and edge cases (like Wi-Fi drops) before moving on to the battery architecture.

**Prerequisites:**
- Core Phase 5B integration is PASSED (S12SD, OLED, Wi-Fi, Backend).
- S12SD calibration remains PROVISIONAL.
- Battery monitoring remains DEFERRED (A0 pin is dedicated to S12SD).

## 1. Sensor & Display Reliability
- [ ] **Repeated Indoor/Outdoor Transitions:** Move the device from indoors (low UV) to direct sunlight (high UV) and back several times. Verify the UV Index dynamically responds and stabilizes without hanging.
- [ ] **OLED Extended Runtime Verification:** Leave the device running for >1 hour. Verify the OLED screen continues to update every 60 seconds without freezing, artifacting, or failing.

## 2. Backend Data Flow
- [ ] **Backend Persistence Check:** After a period of outdoor testing, query the PostgreSQL database (or use Prisma Studio) to verify that the readings are accurately saved in the `readings` table with correct UV Index values and accurate timestamps.

## 3. Resilience & Offline Queue Testing
- [ ] **Wi-Fi Disconnect Test:** While the device is running, turn off the mobile hotspot (or block the device). Verify the OLED switches to `OFFLINE` status within a few seconds.
- [ ] **Offline Queue Test:** Leave the Wi-Fi disconnected for several reading cycles (e.g., 3-5 minutes). Verify the OLED queue counter `Q:X` increments correctly (e.g., Q:1, Q:2, Q:3).
- [ ] **Wi-Fi Reconnection & Flush Test:** Turn the mobile hotspot back on. Verify:
  - The OLED switches back to `ONLINE`.
  - The offline queue flushes all stored readings to the backend.
  - The OLED queue counter drops back to `Q:0`.
- [ ] **Timestamp Verification:** Check the backend database to verify that the flushed offline readings retained their original timestamps (from when they were collected offline) rather than all sharing the timestamp of when the connection was restored.

## Next Phase Gate
Do **NOT** advance to the Battery Architecture phase until all tests in this checklist have been successfully completed and documented.
