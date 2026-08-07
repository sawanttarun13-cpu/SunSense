/**
 * ---------------------------------------------------------
 * File: profile.ts
 * Purpose:
 * TypeScript type definitions for profile.
 * ---------------------------------------------------------
 */

// ─── Fitzpatrick skin type ────────────────────────────────────────────────────
export interface SkinType {
  id: number;
  label: string;
  desc: string;
  tone: string;
  burn: number;
}

// ─── UV sensitivity level ─────────────────────────────────────────────────────
export interface SensitivityLevel {
  label: string;
  rec: number;
  color: string;
}

// ─── User achievement ─────────────────────────────────────────────────────────
export interface Achievement {
  icon: string;
  label: string;
  desc: string;
  earned: boolean;
}
