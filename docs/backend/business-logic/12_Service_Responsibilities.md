# Module 12: Service Responsibilities

## Purpose
Strictly define class boundaries for the future implementation phase (Milestone 5B) to prevent monolithic service files.

## Definitions

### `DeviceIngestionService`
- Validates incoming ESP8266 payloads.
- Routes data to `ExposureLogicService`.
- Updates device heartbeat & battery status.

### `ExposureLogicService` (The Engine)
- Core algorithms for Module 1, 2, and 3.
- Determines when to open/close sessions.
- Calculates SED accumulated dose.
- Writes to `uv_readings` and `exposure_sessions` repositories.

### `CalculationService` (Stateless Utility)
- Pure functions only.
- Calculates Burn Time (Module 4).
- Determines Risk Level (Module 5).
- Determines SPF Recommendation (Module 6).

### `DashboardService`
- Aggregates data for the frontend.
- Calls `CalculationService` dynamically.
- Has no side effects (read-only).

### `SunscreenService`
- Manages sunscreen records (Module 7).
- Calculates time remaining.

### `AnalyticsService`
- Handles grouping and trends (Module 9).

### `HistoryService`
- Handles pagination and session lookups (Module 10).
