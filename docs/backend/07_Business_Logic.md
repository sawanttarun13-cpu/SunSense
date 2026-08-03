# Business Logic Calculations

The backend abstracts complex derivations from the frontend.

## 1. Exposure Sessions (Analytics Layer)
Instead of recalculating historical exposure from every UV reading dynamically, the backend detects and stores discrete **Exposure Sessions**.
- **Detection Logic**: Consecutive UV readings > 0 form a session. If the gap between two readings exceeds a threshold (e.g., 15 minutes of 0.0 readings), the session is considered complete.
- **Storage**: Upon completion, the backend calculates the session's duration, average UV, accumulated SED, and overall risk, then stores it in the `exposure_sessions` table.
- **Reusability**: All historical dashboards and analytics query the `exposure_sessions` table rather than iterating through millions of raw points. Raw UV readings remain the source data but the Sessions table becomes the analytics layer.

## 2. UV Dose (SED - Standard Erythemal Dose)
Calculated cumulatively for the current session.
- **Formula**: `SED += (UV_Index * Time_Delta_Minutes) / 60`

## 3. Burn Time
Calculated dynamically based on Skin Type, UV Index, and Sunscreen.
- **Base Minutes Table**:
  - Type 1: 10 mins (at UV index 1)
  - Type 2: 15 mins
  - Type 3: 20 mins
  - Type 4: 30 mins
  - Type 5: 40 mins
  - Type 6: 60 mins
- **Formula**: 
  `Burn Time Left = ((Base_Minutes * Applied_SPF) / Current_UV) - Exposure_Time_Today`
  *(If no sunscreen applied, Applied_SPF = 1)*

## 4. Risk Level
Derived directly from the UV Index scalar:
- 0.0 - 2.9 : Low
- 3.0 - 5.9 : Moderate
- 6.0 - 7.9 : High
- 8.0 - 10.9: Very High
- 11.0+ : Extreme

## 5. Peak & Low UV
- **Peak UV**: Max UV recorded for the current day.
- **Low UV**: Minimum non-zero UV recorded for the current day.

## 6. Daily/Weekly/Monthly Analytics
Derived primarily by summing and averaging the `exposure_sessions` table for the given timeframe.
