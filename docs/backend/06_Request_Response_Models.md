# Request and Response Models

## 1. POST /api/v1/readings (Device Ingestion)
**Headers**: `x-device-id`, `x-api-key`
**Request Body**:
```json
{
  "readings": [
    { "uvIndex": 6.5, "recordedAt": "2026-08-03T12:00:00Z" }
  ]
}
```
**Response (200 OK)**:
```json
{ "status": "success", "inserted": 1, "duplicates": 0 }
```

## 2. POST /api/v1/devices/heartbeat
**Headers**: `x-device-id`, `x-api-key`
**Request Body**:
```json
{
  "batteryPercentage": 85,
  "chargingState": false,
  "wifiRssi": -65,
  "firmwareVersion": "1.0.2",
  "deviceUptimeSeconds": 86400,
  "sensorHealth": "OK"
}
```
**Response (200 OK)**:
```json
{ "success": true }
```

## 3. GET /api/v1/server/time
**Response (200 OK)**:
```json
{
  "utcTime": "2026-08-03T12:05:00Z",
  "unixTimestamp": 1785758700
}
```

## 4. Standardized Pagination
Endpoints returning lists (History, Alerts, Analytics, Readings) MUST implement the standard pagination response format.

**Request Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response Format**:
```json
{
  "success": true,
  "data": [ ... array of items ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "totalPages": 8,
    "nextPage": 2,
    "previousPage": null
  }
}
```

## Validation Rules (Global)
- `uvIndex`: Must be a Float between 0.0 and 15.0.
- `recordedAt`: Must be a valid ISO-8601 UTC timestamp. Cannot be in the future.
- `spf`: Must be an integer (e.g., 15, 30, 50, 100).
- `alert_threshold`: Decimal > 0.
