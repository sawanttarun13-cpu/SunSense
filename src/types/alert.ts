/**
 * ---------------------------------------------------------
 * File: alert.ts
 * Purpose:
 * TypeScript type definitions for alert.
 * ---------------------------------------------------------
 */

// ─── Alert severity levels ────────────────────────────────────────────────────
export type AlertSeverity = 'extreme' | 'critical' | 'warning' | 'info' | 'resolved';


// ─── Severity visual style ────────────────────────────────────────────────────
export interface SeverityStyle {
  bg: string;
  border: string;
  iconBg: string;
  iconColor: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  label: string;
}
