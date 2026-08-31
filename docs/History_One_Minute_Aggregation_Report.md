# History One Minute Aggregation Report

## Implementation Details

- **PostgreSQL Table Name:** `uv_readings`
- **PostgreSQL Timestamp Column:** `recorded_at`
- **Timestamp Column Type:** `timestamp(6)` (without time zone)

### Exact Aggregation Query
```sql
SELECT 
  device_id as "deviceId",
  date_trunc('minute', recorded_at) as "recordedAt",
  AVG(uv_index) as "averageUvIndex",
  MIN(uv_index) as "minimumUvIndex",
  MAX(uv_index) as "maximumUvIndex",
  COUNT(*)::int as "sampleCount"
FROM uv_readings
WHERE device_id IN ($1::uuid)
GROUP BY device_id, date_trunc('minute', recorded_at)
ORDER BY "recordedAt" DESC
LIMIT $2 OFFSET $3;
```

### Safe Parameterization
- Using `Prisma.sql` template strings to safely interpolate dynamic arrays of `device_id` values and limit/offset parameters, escaping inputs automatically and protecting against SQL injection. `Prisma.join` is used to construct the `IN` clause securely.

### Multi-Device Grouping Semantics
- Grouped specifically by `device_id` and `date_trunc('minute', recorded_at)`, preventing readings from multiple physical devices from blending together in the same minute bucket.

### Pagination Count Semantics
- Executed as `SELECT COUNT(*) FROM ( ... GROUP BY device_id, date_trunc('minute', recorded_at) ) buckets;` guaranteeing that the pagination `total` precisely matches the number of returned bucket rows, including independent device buckets.

### Partial Current Minute Behavior
- Active minutes inherently evaluate whatever samples exist at query time. For example, a query run at 10:07:30 will naturally average the 3 existing samples and set `sampleCount = 3`. No special logic is required to allow incomplete current minutes.

### Verification Scenarios
- **Six-reading test:** 6 readings spanning a single minute successfully yield one row matching `average = 1.5`, `min = 1.0`, `max = 2.0`, `sampleCount = 6`.
- **Next-minute test:** Adding a reading for the next minute correctly initiates a new row preceding the original minute.
- **Offline Backfill:** Timestamps rely exclusively on the `recordedAt` property natively submitted by the S12SD hardware, immune to server delays or connection drops.
- **CSV Semantics:** CSV is populated explicitly from the paginated API output. It yields matching multi-field summaries (Avg/Min/Max/Samples).
- **Dashboard Regression:** Dashboard remains backed by `DashboardService`/real-time raw data pipeline, explicitly unmodified.
- **Analytics Regression:** `ExposureLogicService` continues functioning over independent device batches.
- **Smart Alert Regression:** `SmartAlertEngineService` continues processing events from `DeviceIngestionService` immediately before persistence; unaffected by the downsampling query on `GET /api/v1/readings/history`.

HISTORY RESOLUTION:
1 MINUTE

RAW INGESTION RESOLUTION:
10 SECONDS

RAW READINGS PRESERVED:
YES

DATABASE STORAGE REDUCED:
NO

HISTORY ROW COUNT REDUCED:
YES

POSTGRES AGGREGATION:
PASS

SAFE PARAMETERIZATION:
PASS

MULTI-DEVICE AGGREGATION:
PASS

MINUTE AVERAGE:
PASS

MIN/MAX/SAMPLE COUNT:
PASS

PAGINATION:
PASS

CURRENT MINUTE REALTIME UPDATE:
PASS

OFFLINE BACKFILL:
PASS

CSV:
PASS

DASHBOARD RAW REALTIME UNAFFECTED:
YES

SMART ALERTS RAW DATA UNAFFECTED:
YES

ANALYTICS UNAFFECTED:
YES

FRONTEND BUILD:
PASS

BACKEND BUILD:
PASS

READY FOR PHASE 11 TESTING:
YES

STOP.
