# Module 6: Preferred SPF Recommendation

## Purpose
Recommend an appropriate Sun Protection Factor (SPF) based on current environmental conditions and the user's inherent skin type.

## Inputs
- `uvIndex` (Current peak/average)
- `skinType` (1-6)

## Outputs
- Recommended SPF (Integer: 15, 30, 50).

## Required Database Tables
- `users` (Skin Type)
- `uv_readings`

## Update Frequency
- Calculated dynamically for Dashboard presentation.

## Algorithm (Decision Tree)
1. If **UVI < 3.0 (LOW)**:
   - Skin Types 1-2: Recommend SPF 15 (if staying outside > 30 mins).
   - Skin Types 3-6: No SPF required (0).
2. If **UVI 3.0 - 5.9 (MODERATE)**:
   - Skin Types 1-3: Recommend SPF 30.
   - Skin Types 4-6: Recommend SPF 15.
3. If **UVI 6.0 - 7.9 (HIGH)**:
   - Skin Types 1-4: Recommend SPF 50.
   - Skin Types 5-6: Recommend SPF 30.
4. If **UVI >= 8.0 (VERY HIGH / EXTREME)**:
   - All Skin Types: Recommend SPF 50.

## Edge Cases
- **Overriding Preferences**: The user can set a `preferred_spf` in their profile. If the calculated recommendation is *lower* than their preferred SPF, output their preferred SPF.
- **Nighttime**: Return 0.

## Future Scalability
- Factoring in clothing types or geographic location (UV index forecast for the day).
