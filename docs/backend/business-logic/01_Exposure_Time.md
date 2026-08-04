# Module 1: Exposure Time

## Purpose
Track continuous periods of sun exposure, determining exactly when a user begins and ends their exposure to UV radiation.

## Inputs
- Incoming `uv_readings` array from device uploads (ESP8266).
- Each reading contains: `deviceId`, `uvIndex`, `recordedAt`.

## Outputs
- Start and End timestamps of an active session.
- Total accumulated duration in seconds.

## Required Database Tables
- `uv_readings`
- `exposure_sessions`

## Update Frequency
- On every successful sync from the device (typically every few minutes when Wi-Fi is available, or upon reconnection).

## Algorithm
1. **Sort**: Order all incoming unassigned `uv_readings` chronologically by `recordedAt`.
2. **Start Condition**: Exposure begins on the first reading where `uvIndex > 0.0`.
3. **Accumulation**: Subsequent readings extend the current exposure time. The time added is `(current_reading.recordedAt - previous_reading.recordedAt)`.
4. **End Condition (Gaps)**: If the gap between two consecutive readings is **greater than 15 minutes**, the current exposure session is closed. A new session begins with the next non-zero reading.
5. **End Condition (Zero UV)**: If continuous `0.0` readings are recorded for **longer than 15 minutes**, the session is closed at the timestamp of the first zero reading.
6. **End Condition (Midnight)**: Sessions do not span across local midnight. A reading crossing midnight forces the session to close at 23:59:59, and a new one opens at 00:00:00.

## Edge Cases
- **Missing Readings / Device Offline**: Readings uploaded hours later in a batch are processed identically (sorted chronologically).
- **Out of Order Timestamps**: Always sort `recordedAt` ascending before processing.
- **Single Reading Session**: A single non-zero reading with no follow-up is assigned a default duration of 60 seconds.

## Future Scalability
- Timezone handling: Ensure midnight cuts are processed in the user's localized timezone, not purely UTC.
