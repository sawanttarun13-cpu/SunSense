/**
 * --------------------------------------------------------
 * File: calculation.service.ts
 * Layer: Business Logic / Pure Calculation Engine
 *
 * Purpose:
 * The single source of truth for all mathematical formulas
 * used in the SunSense system. This class is intentionally
 * stateless (no constructor dependencies, no database access)
 * so that every formula can be tested in isolation and
 * reused across multiple services without side effects.
 *
 * Formulas Implemented:
 * - SED (Standard Erythemal Dose)        Module 3
 * - Unprotected Burn Time                Module 4
 * - Protected Burn Time (with SPF)       Module 4
 * - UV Risk Level classification         Module 5
 * - Preferred SPF recommendation         Module 6
 *
 * Layer:
 * Business Logic (Pure calculation — no I/O)
 *
 * Used By:
 * - ExposureLogicService  (SED, Risk per reading)
 * - DashboardService      (Risk, SPF for current UV)
 *
 * Does NOT:
 * - Access the database
 * - Call other services
 * - Perform any I/O
 * --------------------------------------------------------
 */
import { RiskLevel } from '@prisma/client';

export class CalculationService {

  // ─── Module 3: SED Calculation ───────────────────────────────────────────────

  /**
   * Calculates the Standard Erythemal Dose (SED) increment for a
   * single time interval between two consecutive UV readings.
   *
   * Formula:
   *   SED = (UV Index × Time Interval in Seconds) / 4000
   *
   * The SED unit is a standardised measure of erythemal (sunburn-inducing)
   * UV radiation exposure. 1 SED = 100 J/m² of erythemal UV radiation.
   * A SED of ~3.7 typically corresponds to a minimum erythemal dose for
   * fair skin (Fitzpatrick Type II) in direct equatorial sun.
   *
   * Guard Conditions:
   * - Returns 0 if uvIndex ≤ 0 (device indoors, covered, or UV below threshold).
   * - Returns 0 if the gap is > 15 minutes (900 seconds), which signals that
   *   the session ended and the device reconnected — accumulating SED across
   *   this gap would produce an inaccurate dose estimate.
   *
   * @param uvIndex           - Current UV Index reading from the S12SD sensor (≥ 0).
   * @param timeIntervalSeconds - Elapsed seconds between the previous and current reading.
   * @returns                 SED increment to be added to the session's running total.
   *
   * @example
   * // UVI 8 for 30 minutes:
   * calcService.calculateSedIncrement(8, 1800); // → 3.6
   */
  calculateSedIncrement(uvIndex: number, timeIntervalSeconds: number): number {
    if (uvIndex <= 0) return 0;
    // A gap longer than 15 minutes means the user stepped indoors;
    // do not accumulate dose across the break.
    if (timeIntervalSeconds > 900 || timeIntervalSeconds < 0) return 0;
    return (uvIndex * timeIntervalSeconds) / 4000;
  }

  // ─── Module 4: Burn Time ─────────────────────────────────────────────────────

  /**
   * Calculates how many minutes unprotected skin can tolerate the current UV
   * before experiencing erythema (sunburn) — the Minimal Erythema Dose (MED).
   *
   * Formula:
   *   Burn Time (minutes) = Base Burn Time / UV Index
   *
   * Base burn times are derived from the WHO Fitzpatrick scale:
   *
   * | Skin Type | Description          | Base Time |
   * |-----------|----------------------|-----------|
   * | 1         | Very fair (burns)    | 67 min    |
   * | 2         | Fair                 | 100 min   |
   * | 3         | Medium               | 200 min   |
   * | 4         | Olive                | 300 min   |
   * | 5         | Brown                | 400 min   |
   * | 6         | Dark                 | 500 min   |
   *
   * @param uvIndex  - Current UV Index (must be > 0).
   * @param skinType - User's Fitzpatrick skin type (1–6).
   * @returns        Minutes until sunburn, or null if UV is 0 (no risk).
   *
   * @example
   * calcService.calculateUnprotectedBurnTime(8, 3); // → 25 minutes
   */
  calculateUnprotectedBurnTime(uvIndex: number, skinType: number): number | null {
    if (uvIndex <= 0) return null;
    const baseBurnTimes: Record<number, number> = { 1: 67, 2: 100, 3: 200, 4: 300, 5: 400, 6: 500 };
    const base = baseBurnTimes[skinType] || 200; // Default to Type 3 if unknown
    return Math.floor(base / uvIndex);
  }

  /**
   * Calculates the protected burn time when sunscreen is applied.
   *
   * Formula:
   *   Protected Burn Time = Unprotected Burn Time × SPF
   *
   * SPF (Sun Protection Factor) is a multiplier that extends the time
   * before erythema occurs. SPF 30 means the skin can tolerate 30×
   * more UV exposure than without protection.
   *
   * @param unprotectedBurnTime - Result of calculateUnprotectedBurnTime() in minutes.
   *                              Pass null if no UV risk (returns null).
   * @param appliedSpf          - SPF factor of the applied sunscreen (must be ≥ 1).
   * @returns                   Protected burn time in minutes, or null if no UV risk.
   *
   * @example
   * calcService.calculateProtectedBurnTime(25, 30); // → 750 minutes
   */
  calculateProtectedBurnTime(unprotectedBurnTime: number | null, appliedSpf: number): number | null {
    if (unprotectedBurnTime === null) return null;
    return unprotectedBurnTime * Math.max(1, appliedSpf);
  }

  // ─── Module 5: Risk Level ────────────────────────────────────────────────────

  /**
   * Classifies a UV Index value into a WHO standard risk level.
   *
   * WHO UV Index Risk Scale:
   *
   * | UV Index   | Risk Level | Recommended Action                        |
   * |------------|------------|-------------------------------------------|
   * | 0 – 2.9    | LOW        | No protection required                    |
   * | 3.0 – 5.9  | MODERATE   | Seek shade during midday; wear sunscreen  |
   * | 6.0 – 7.9  | HIGH       | Reduce time in the sun; cover up          |
   * | 8.0 – 10.9 | VERY_HIGH  | Minimise sun exposure 10am–4pm            |
   * | 11.0+      | EXTREME    | Avoid sun; maximum protection required    |
   *
   * @param uvIndex - Current UV Index (0 to ~20).
   * @returns       One of: LOW | MODERATE | HIGH | VERY_HIGH | EXTREME
   *
   * @example
   * calcService.calculateRisk(7.5); // → 'HIGH'
   * calcService.calculateRisk(11);  // → 'EXTREME'
   */
  calculateRisk(uvIndex: number): RiskLevel {
    if (uvIndex < 3.0) return 'LOW';
    if (uvIndex < 6.0) return 'MODERATE';
    if (uvIndex < 8.0) return 'HIGH';
    if (uvIndex < 11.0) return 'VERY_HIGH';
    return 'EXTREME';
  }

  // ─── Module 6: Preferred SPF ─────────────────────────────────────────────────

  /**
   * Recommends the minimum SPF value the user should apply given their
   * current UV exposure level and skin type.
   *
   * The recommendation table follows WHO and Australian Cancer Council guidelines:
   *
   * | UV Index   | Skin 1–2 | Skin 3   | Skin 4   | Skin 5–6 |
   * |------------|----------|----------|----------|----------|
   * | < 3        | SPF 15   | 0        | 0        | 0        |
   * | 3.0 – 5.9  | SPF 30   | SPF 30   | SPF 15   | SPF 15   |
   * | 6.0 – 7.9  | SPF 50   | SPF 50   | SPF 50   | SPF 30   |
   * | 8.0+       | SPF 50   | SPF 50   | SPF 50   | SPF 50   |
   *
   * @param uvIndex  - Current UV Index reading.
   * @param skinType - User's Fitzpatrick skin type (1–6).
   * @returns        Recommended SPF integer (0, 15, 30, or 50).
   *                 0 means no protection is currently needed.
   *
   * @example
   * calcService.recommendSpf(7.0, 2); // → 50 (HIGH UV, very fair skin)
   * calcService.recommendSpf(2.5, 5); // → 0  (LOW UV, dark skin)
   */
  recommendSpf(uvIndex: number, skinType: number): number {
    if (uvIndex < 3.0) return skinType <= 2 ? 15 : 0;
    if (uvIndex < 6.0) return skinType <= 3 ? 30 : 15;
    if (uvIndex < 8.0) return skinType <= 4 ? 50 : 30;
    return 50;
  }
}
