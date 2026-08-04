# Module 16: Traceability Matrix

## Purpose
Map client requirements to Business Logic Modules, Database Tables, and Future Services to ensure 100% coverage.

| Client Requirement | Business Logic Module | Database Table | Future Service |
| :--- | :--- | :--- | :--- |
| Calculate UV Index | Handled by Firmware | `uv_readings` | `DeviceIngestionService` |
| Track Exposure Time | 01_Exposure_Time, 02_Exposure_Sessions | `exposure_sessions` | `ExposureLogicService` |
| Calculate SED Dose | 03_UV_Dose_SED | `exposure_sessions` | `ExposureLogicService` |
| Burn Time Prediction | 04_Burn_Time | N/A (Dynamic) | `CalculationService` |
| Risk Level Assessment | 05_Risk_Level | `exposure_sessions` | `CalculationService` |
| SPF Recommendation | 06_Preferred_SPF | N/A (Dynamic) | `CalculationService` |
| Sunscreen Tracker | 07_Sunscreen_Tracker | `sunscreen_applications` | `SunscreenService` |
| Dashboard Display | 08_Dashboard_Metrics | All Tables | `DashboardService` |
| Smart Alerts | 07_Sunscreen_Tracker, future expansion | `alerts` | `AlertService` |
| Analytics & History | 09_Analytics, 10_History | `exposure_sessions` | `AnalyticsService`, `HistoryService` |
