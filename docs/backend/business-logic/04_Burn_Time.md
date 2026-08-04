# Module 4: Burn Time

## Purpose
Estimate the time remaining before the user experiences skin damage (erythema) based on their skin type, current UV intensity, and applied protection.

## Inputs
- User Skin Type (1-6) from `users.skin_type`
- Current `uvIndex`
- Applied SPF (from `sunscreen_applications`)

## Outputs
- Estimated `burnTimeMinutes` (Integer).

## Required Database Tables
- `users`
- `sunscreen_applications`
- `uv_readings`

## Update Frequency
- Calculated dynamically on-demand for Dashboard metrics. Not permanently stored.

## Algorithm
1. **Determine Base Burn Time (at UVI 1.0 without SPF)**:
   - Type 1: 67 minutes
   - Type 2: 100 minutes
   - Type 3: 200 minutes
   - Type 4: 300 minutes
   - Type 5: 400 minutes
   - Type 6: 500 minutes
2. **Calculate Unprotected Burn Time**:
   `Unprotected Burn Time = Base Burn Time / Current UVI`
3. **Calculate Protected Burn Time**:
   If an active sunscreen application exists:
   `Protected Burn Time = Unprotected Burn Time * Applied SPF`
4. **Calculate Remaining Burn Time**:
   `Remaining Time = Protected Burn Time - (Exposure duration since application)`

## Edge Cases
- **UVI = 0**: Burn time is functionally infinite. Return `-1` or `null` (Safe).
- **No Active SPF**: Multiplier is 1.
- **Negative Remaining Time**: The user is currently burning. Return `0`.

## Future Scalability
- Personalization based on historical burn reporting (user feedback tuning).
