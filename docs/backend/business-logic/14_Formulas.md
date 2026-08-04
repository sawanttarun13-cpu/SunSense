# Module 14: Formulas Master List

## Purpose
Centralize every mathematical equation used in the business logic engine.

## 1. SED (Standard Erythemal Dose)
`SED_increment = (UVI * time_interval_seconds) / 4000`
- *UVI*: Current UV Index.
- *time_interval_seconds*: Seconds since the last reading.

## 2. Unprotected Burn Time
`Unprotected_Burn_Time_Minutes = Base_Skin_Type_Time / UVI`
- *Base_Skin_Type_Time*: Constants (Type 1: 67, Type 2: 100, Type 3: 200, Type 4: 300, Type 5: 400, Type 6: 500).

## 3. Protected Burn Time
`Protected_Burn_Time_Minutes = Unprotected_Burn_Time_Minutes * Applied_SPF`

## 4. Remaining Sunscreen Protection
`Time_Remaining_Minutes = 120 - (Current_Time - Applied_Time_In_Minutes)`
- Hardcapped at 0 (Expired).

## 5. Session Duration
`Duration_Seconds = End_Timestamp - Start_Timestamp`

## 6. Average UV Index (Session)
`Average_UVI = Sum(UVI_readings) / Count(UVI_readings)`
