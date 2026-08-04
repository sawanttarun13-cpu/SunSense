import { RiskLevel } from '@prisma/client';

export class CalculationService {
  // Module 3: SED Calculation
  calculateSedIncrement(uvIndex: number, timeIntervalSeconds: number): number {
    if (uvIndex <= 0) return 0;
    if (timeIntervalSeconds > 900 || timeIntervalSeconds < 0) return 0; // Gap > 15m
    return (uvIndex * timeIntervalSeconds) / 4000;
  }

  // Module 4: Burn Time
  calculateUnprotectedBurnTime(uvIndex: number, skinType: number): number | null {
    if (uvIndex <= 0) return null;
    const baseBurnTimes: Record<number, number> = { 1: 67, 2: 100, 3: 200, 4: 300, 5: 400, 6: 500 };
    const base = baseBurnTimes[skinType] || 200;
    return Math.floor(base / uvIndex);
  }

  calculateProtectedBurnTime(unprotectedBurnTime: number | null, appliedSpf: number): number | null {
    if (unprotectedBurnTime === null) return null;
    return unprotectedBurnTime * Math.max(1, appliedSpf);
  }

  // Module 5: Risk Level
  calculateRisk(uvIndex: number): RiskLevel {
    if (uvIndex < 3.0) return 'LOW';
    if (uvIndex < 6.0) return 'MODERATE';
    if (uvIndex < 8.0) return 'HIGH';
    if (uvIndex < 11.0) return 'VERY_HIGH';
    return 'EXTREME';
  }

  // Module 6: Preferred SPF
  recommendSpf(uvIndex: number, skinType: number): number {
    if (uvIndex < 3.0) return skinType <= 2 ? 15 : 0;
    if (uvIndex < 6.0) return skinType <= 3 ? 30 : 15;
    if (uvIndex < 8.0) return skinType <= 4 ? 50 : 30;
    return 50;
  }
}
