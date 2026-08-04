# Module 13: Global Edge Cases

## Purpose
Document how the system behaves under suboptimal, unexpected, or failure conditions.

## Scenarios

1. **No Readings / Sensor Disconnected**
   - The ESP8266 uploads `0.0` or fails to send data.
   - Backend handles gaps by closing active sessions. Dashboard shows UVI 0, Risk LOW.

2. **Offline Uploads**
   - ESP8266 stores readings locally while away from Wi-Fi.
   - Connects and sends an array of past readings.
   - `ExposureLogicService` MUST sort the array by `recordedAt` and process them chronologically simulating real-time flow to ensure sessions split correctly on 15m gaps.

3. **Duplicate Readings**
   - A network retry causes the same payload to be sent twice.
   - Database unique constraint `@@unique([deviceId, recordedAt])` rejects the second insert. Engine ignores the duplicate.

4. **Out-of-Order Timestamps**
   - Prevented by strict sorting at the ingestion layer before processing.

5. **Zero UV & Night Time**
   - UVI `0.0` does not accumulate SED. Sustained zeros close sessions. Nighttime guarantees sessions close naturally.

6. **Invalid UV Values**
   - Malfunctioning sensor sends UVI `999`.
   - Ingestion validator rejects readings > `30.0` as physically impossible, preventing corruption of SED totals.

7. **Battery Unavailable**
   - Falls back to `null`. Dashboard displays "Unknown" icon.

8. **Missing Sunscreen Information**
   - If user doesn't apply sunscreen, calculations strictly assume `SPF = 1` and Burn Time degrades rapidly.
