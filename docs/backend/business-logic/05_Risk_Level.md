# Module 5: Risk Level

## Purpose
Translate numerical UV Index values into globally recognized qualitative risk categories as defined by the WHO.

## Inputs
- `uvIndex` (Decimal)

## Outputs
- Risk Category: `LOW`, `MODERATE`, `HIGH`, `VERY_HIGH`, `EXTREME`.

## Required Database Tables
- `exposure_sessions` (Stores max calculated risk for the session)

## Update Frequency
- Calculated dynamically for current dashboard status.
- Evaluated per reading to determine the peak risk level of an `exposure_session`.

## Algorithm (Thresholds)
- **LOW**: UVI < 3.0
- **MODERATE**: 3.0 <= UVI < 6.0
- **HIGH**: 6.0 <= UVI < 8.0
- **VERY_HIGH**: 8.0 <= UVI < 11.0
- **EXTREME**: UVI >= 11.0

## Edge Cases
- **Invalid UV**: If UVI is physically impossible (e.g., > 30 on Earth), cap at EXTREME but flag device for sensor calibration.

## Future Scalability
- Adjusting risk dynamically based on ambient temperature or elevation (if fetched from weather APIs).
