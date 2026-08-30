/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: dashboard.ts (types)
 * Layer: Frontend / TypeScript Types
 *
 * Purpose:
 * Defines the TypeScript type for a single stat card on the Dashboard.
 * Used by the DashboardStats component.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { LucideProps } from 'lucide-react';

/**
 * Represents a single statistic card displayed on the Dashboard page.
 *
 * Properties:
 * - id        → Unique identifier for keying in lists
 * - icon      → Lucide icon component to display in the card header
 * - label     → Human-readable metric name (e.g., "Today's Exposure")
 * - value     → The formatted metric value string (e.g., "2h 34m")
 * - sub       → Secondary label below the value (e.g., "3 sessions")
 * - iconColor → CSS colour for the icon
 * - iconBg    → CSS background colour for the icon container
 * - delta     → Optional trend indicator showing change vs. previous period
 *   - dir     → 'up' (value increased) or 'down' (value decreased)
 *   - val     → Formatted change string (e.g., "+12%")
 */
export interface DashboardStat {
  id: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  label: string;
  value: string;
  sub: string;
  iconColor: string;
  iconBg: string;
  delta?: {
    dir: 'up' | 'down';
    val: string;
  };
}

/**
 * Backend response structure for the Dashboard endpoint.
 * (GET /api/v1/dashboard)
 */
export interface DashboardResponse {
  deviceConnected: boolean;
  deviceStatus?: 'ONLINE' | 'OFFLINE';
  batteryStatus?: number | null;
  lastSync?: string | Date;
  todayExposure?: number;
  todayDose?: number;
  peakUv?: number;
  peakTime?: string | null;
  averageUv?: number;
  currentUv?: number;
  lowUv?: number | null;
  lowTime?: string | null;
  currentRisk?: string;
  currentSpfRecommendation?: number;
  activeProtection?: boolean;
  protectionRemaining?: number;
  burnTimeRemaining?: number | null;
  activeAlertsCount?: number;
  hourlyData?: Array<{
    hour: string;
    uv: number | null;
    isCurrent: boolean;
  }>;
  error?: string;
}
