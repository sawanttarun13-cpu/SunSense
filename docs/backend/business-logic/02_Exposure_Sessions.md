# Module 2: Exposure Sessions

## Purpose
Group individual, continuous UV readings into discrete sun exposure events (sessions) to summarize exposure statistics and limit database load for historical queries.

## Inputs
- Continuous stream of processed `uv_readings`.

## Outputs
- A saved `ExposureSession` record.

## Required Database Tables
- `exposure_sessions`

## Update Frequency
- Created upon session initiation. Updated incrementally as new readings arrive that belong to the active session. Finalized upon closure.

## Algorithm
1. **Creation**: When a new exposure time period starts (see Module 1), instantiate a new row in `exposure_sessions`.
2. **Attaching Readings**: Any reading falling between `session.startTime` and `session.endTime` belongs to the session.
3. **Running Statistics**:
   - `durationSeconds`: `endTime - startTime`.
   - `averageUvIndex`: Mean of all UV readings in the session.
   - `accumulatedSed`: Running sum of calculated SED (see Module 3).
   - `calculatedRisk`: Peak Risk Level reached during the session (see Module 5).
4. **Closure**: Triggered when the exposure time ends (gap > 15 mins, continuous zero UV, or midnight).

## Edge Cases
- **Duplicate Uploads**: If the ESP8266 uploads the same `recordedAt` reading twice, the database unique constraint `@@unique([deviceId, recordedAt])` drops the duplicate, preventing session corruption.
- **Very Short Sessions**: Sessions lasting under 60 seconds with negligible UV index are kept but may be hidden from high-level UI if deemed noise.

## Future Scalability
- Support for session merging if the user manually overrides a gap.
- Background jobs to recalculate sessions if historical readings are modified.
