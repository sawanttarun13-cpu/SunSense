# Module 7: Sunscreen Tracker

## Purpose
Manage sunscreen application events, track expiration, and trigger reapplications.

## Inputs
- User applies sunscreen via UI (Payload: `appliedSpf`, `appliedAt`).

## Outputs
- New `sunscreen_applications` record.
- Expiration state for Dashboard.
- Reapplication Smart Alert.

## Required Database Tables
- `sunscreen_applications`
- `alerts`

## Update Frequency
- Event-driven (when user applies).
- Evaluated continuously on Dashboard load.

## Algorithm
1. **Application Event**:
   - Save record to DB with `userId`, `appliedSpf`, `appliedAt`.
2. **Expiration Calculation**:
   - Dermatologist standard: Reapply every 2 hours (120 minutes).
   - `expiresAt = appliedAt + 120 minutes`.
3. **Dashboard State**:
   - Time Remaining = `(expiresAt - now)`.
   - If `now > expiresAt`, state is EXPIRED.
4. **Smart Alerts**:
   - A cron job checks for applications where `now` is within 15 minutes of `expiresAt`.
   - Triggers a `REAPPLY_SUNSCREEN` alert to the user.
5. **Manual Reset**:
   - If user reapplies early, create a new record. The active record is always the one with the latest `expiresAt`.

## Edge Cases
- **Sweat/Water**: Currently relies on strict 2-hour rule. Future iterations could allow user to toggle "Swimming", reducing expiration to 40 or 80 minutes.
- **Overlapping Applications**: Always rely on `ORDER BY appliedAt DESC LIMIT 1`.

## Future Scalability
- Adjusting expiration based on accumulated SED rather than strict time (e.g., intense UV degrades sunscreen faster).
