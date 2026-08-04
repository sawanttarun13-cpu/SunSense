# Module 8: Dashboard Metrics

## Purpose
Provide aggregated, real-time metrics for the primary user dashboard.

## Inputs
- Database queries across multiple tables for the current user/device.

## Outputs
- Combined JSON object containing real-time status and daily totals.

## Required Database Tables
- `uv_readings`
- `exposure_sessions`
- `devices`
- `sunscreen_applications`

## Update Frequency
- On every GET request to `/api/v1/dashboard`.

## Algorithm
1. **Current UV & Peak UV**:
   - Fetch latest `uv_readings` for device.
   - Peak UV: `MAX(uvIndex)` from today's readings.
2. **Today's Exposure & Dose**:
   - `SUM(durationSeconds)` from `exposure_sessions` where `startTime` > midnight.
   - `SUM(accumulatedSed)` from same.
3. **Device Status**:
   - Check `lastPing` from `devices`. If `now - lastPing < 5 mins`, status = ONLINE. Otherwise OFFLINE.
   - Retrieve `batteryLevel`.
4. **Active Protection**:
   - Fetch latest `sunscreen_applications`. Check if `expiresAt > now`.

## Edge Cases
- **Timezone Shifts**: Ensure "midnight" is based on the user's local timezone.
- **No Data**: Return zeros safely without failing.

## Future Scalability
- Caching dashboard metrics in Redis to prevent heavy DB hits on frequent reloads.
