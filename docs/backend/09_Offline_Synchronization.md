# Offline Synchronization

## 1. Hardware Queue Structure
- If the ESP8266 loses Wi-Fi connection, it stores readings locally in its SPIFFS/EEPROM memory or an internal RAM array (depending on capacity).
- Each stored record consists of: `[Timestamp, UV_Index]`.

## 2. Upload and Retry Logic
- Upon Wi-Fi reconnection, the ESP8266 attempts to flush the queue by sending a bulk payload to `POST /readings`.
- **Oldest First**: The array is structured chronologically.
- **Bulk Limit**: Payloads are batched (e.g., 50 readings per request) to prevent timeout or payload-too-large errors.

## 3. Duplicate Prevention & Conflict Resolution
- The database enforces a `UNIQUE` constraint on `(device_id, recorded_at)`.
- **Conflict Resolution**: The SQL insertion uses an "Upsert" mechanism (e.g., `ON CONFLICT DO NOTHING` in Postgres).
- This ensures that if the device accidentally re-uploads a packet due to a dropped network acknowledgement, no duplicate data is created.

## 4. Acknowledgements
- The backend responds with HTTP 200 OK only if the transaction successfully commits to the database.
- Upon receiving HTTP 200 OK, the ESP8266 deletes those specific readings from its local queue.
- If it receives a 4xx or 5xx, or a timeout occurs, the ESP8266 retains the data and retries on the next interval.

## 5. Timestamp Validation
- The backend rejects readings with a `recorded_at` timestamp in the future.
- Extremely old readings (e.g., > 30 days) may be logged but not used in current day analytics, preventing skewed dashboards.
- A `device_sync_logs` entry is created to audit the bulk upload size and timestamp.
