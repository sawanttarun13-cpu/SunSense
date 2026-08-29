import type { AlertSeverity, SeverityStyle } from '../types/alert';

// ─── Severity visual styles ───────────────────────────────────────────────────
export const SEVERITY_STYLES: Record<AlertSeverity, SeverityStyle> = {
  extreme:  { bg: '#FDF4FF', border: '#D8B4FE', iconBg: '#F3E8FF', iconColor: '#9333EA', dotColor: '#9333EA', badgeBg: '#F3E8FF', badgeText: '#9333EA', label: 'Extreme'  },
  critical: { bg: '#FFF1F2', border: '#FECDD3', iconBg: '#FFE4E6', iconColor: '#E11D48', dotColor: '#E11D48', badgeBg: '#FFE4E6', badgeText: '#E11D48', label: 'Critical' },
  warning:  { bg: '#FFFBEB', border: '#FDE68A', iconBg: '#FEF3C7', iconColor: '#D97706', dotColor: '#D97706', badgeBg: '#FEF3C7', badgeText: '#D97706', label: 'Warning'  },
  info:     { bg: '#EFF6FF', border: '#BFDBFE', iconBg: '#DBEAFE', iconColor: '#2563EB', dotColor: '#2563EB', badgeBg: '#DBEAFE', badgeText: '#2563EB', label: 'Info'     },
  resolved: { bg: '#F0FDF4', border: '#BBF7D0', iconBg: '#DCFCE7', iconColor: '#16A34A', dotColor: '#22C55E', badgeBg: '#DCFCE7', badgeText: '#16A34A', label: 'Resolved' },
};

// ─── Filter tab definitions ───────────────────────────────────────────────────
export const FILTER_TABS: { key: AlertSeverity | 'all'; label: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'extreme',  label: 'Extreme'  },
  { key: 'critical', label: 'Critical' },
  { key: 'warning',  label: 'Warning'  },
  { key: 'info',     label: 'Info'     },
  { key: 'resolved', label: 'Resolved' },
];
