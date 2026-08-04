# Module 9: Analytics Engine

## Purpose
Generate historical aggregations (Daily, Weekly, Monthly) for charting and trend analysis.

## Inputs
- `timeframe` (daily, weekly, monthly)
- `exposure_sessions` historical data.

## Outputs
- Array of aggregated data points (e.g., `{ date, totalDose, totalTime, maxUv }`).

## Required Database Tables
- `exposure_sessions`

## Update Frequency
- On demand via `/api/v1/analytics`.

## Algorithm
1. **Grouping**:
   - Daily: Group sessions by day.
   - Weekly: Group sessions by week (e.g., ISO week).
   - Monthly: Group sessions by month.
2. **Aggregation**:
   - Total Time = `SUM(durationSeconds)`
   - Total Dose = `SUM(accumulatedSed)`
   - Max UV = `MAX(calculatedRisk)` or `MAX(averageUvIndex)` (Peak UV needs to be stored or fetched via joined readings if exact peak is needed. For MVP, use the highest average or max recorded per session).
3. **Trends**:
   - Compare current period to previous period. (e.g., "Dose is 20% higher than last week").

## Edge Cases
- **Gaps in Data**: Fill missing days/weeks with zero-values so charts render continuously.

## Future Scalability
- Pre-calculating daily summaries into a materialized view or `daily_summaries` table to dramatically speed up monthly/yearly queries.
