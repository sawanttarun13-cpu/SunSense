# Module 10: History Logic

## Purpose
Serve detailed logs of past exposure sessions for the user's History tab.

## Inputs
- Pagination (`page`, `limit`)
- Filters (`startDate`, `endDate`)

## Outputs
- Paginated list of `ExposureSession` objects.

## Required Database Tables
- `exposure_sessions`

## Update Frequency
- On demand via `/api/v1/history`.

## Algorithm
1. **Filtering**: Apply Prisma `where` clauses for `startTime >= startDate` and `startTime <= endDate`.
2. **Sorting**: Always `ORDER BY startTime DESC` (newest first).
3. **Pagination**: `skip = (page - 1) * limit`, `take = limit`.
4. **Formatting**: Return precise duration, start/end times, and average UVI.

## Edge Cases
- **Massive Limits**: Hard cap `limit` at 100 to prevent DoS.
- **Empty Pages**: Return empty array with `hasNext = false`.

## Future Scalability
- Allowing export to CSV/PDF.
