// ─── Alert severity levels ────────────────────────────────────────────────────
export type AlertSeverity = 'extreme' | 'critical' | 'warning' | 'info' | 'resolved';

// ─── Single alert item ────────────────────────────────────────────────────────
export interface AlertItem {
  id: number;
  severity: AlertSeverity;
  title: string;
  message: string;
  time: string;
  uvValue?: number;
  icon: React.ElementType;
  isNew?: boolean;
}

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
