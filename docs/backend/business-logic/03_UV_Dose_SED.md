# Module 3: UV Dose (SED)

## Purpose
Calculate the Standard Erythemal Dose (SED), a standardized measure of erythemally effective UV radiant exposure. 1 SED = 100 J/m².

## Inputs
- `uvIndex` (Current reading)
- `time_interval_seconds` (Time since last reading)

## Outputs
- Incremental SED value for the interval.
- Total accumulated SED for a session/day.

## Required Database Tables
- `uv_readings` (source data)
- `exposure_sessions` (stores `accumulated_sed`)

## Update Frequency
- Calculated per interval between consecutive readings during device sync.

## Algorithm (Formula)
1. Convert UV Index to Erythemal Irradiance (W/m²):
   `Irradiance (W/m²) = UVI * 0.025`
2. Calculate Dose (Joules/m²):
   `Dose (J/m²) = Irradiance * time_interval_seconds`
3. Convert Dose to SED:
   `SED = Dose / 100`

**Simplified Formula**:
`SED_increment = (UVI * time_interval_seconds) / 4000`

## Accumulation Logic
- **Daily Reset**: SED resets to 0 at local midnight.
- **Session SED**: Sum of all `SED_increments` within the session.
- **Daily SED**: Sum of `accumulated_sed` for all sessions on a given date.

## Edge Cases
- **Interval Limits**: If `time_interval_seconds` > 15 minutes (900s), do not calculate a massive SED block; this indicates a gap, so close the session instead.
- **Negative UV**: Treat any UVI < 0 as 0.

## Future Scalability
- Incorporating ozone data or weather API corrections to cross-validate sensor drift.
