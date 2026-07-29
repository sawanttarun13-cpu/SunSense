import { AlertTriangle, Zap, Shield, Bell, Info, CheckCircle, Sun, X } from 'lucide-react';
import type { AlertItem, AlertSeverity, SeverityStyle } from '../types/alert';

// ─── Alert data ───────────────────────────────────────────────────────────────
export const ALERT_DATA: AlertItem[] = [
  { id: 1,  severity: 'extreme',  title: 'Extreme UV Event',             message: 'UV index reached 11.4 — extreme levels detected. Seek shade immediately and apply SPF 50+ sunscreen.',                                              time: 'Today · 12:45 PM',    uvValue: 11.4, icon: Zap,           isNew: true },
  { id: 2,  severity: 'critical', title: 'Very High UV Warning',         message: 'UV index 9.3. Apply broad-spectrum sunscreen, wear protective clothing and limit sun exposure to 15 minutes.',                                          time: 'Today · 11:30 AM',    uvValue: 9.3,  icon: AlertTriangle,  isNew: true },
  { id: 3,  severity: 'warning',  title: 'SPF Reapplication Reminder',   message: '2 hours have passed since your last sunscreen application. Reapply SPF 30+ now for continued protection.',                                              time: 'Today · 10:00 AM',                  icon: Shield,         isNew: true },
  { id: 4,  severity: 'critical', title: 'Rapid UV Spike Detected',      message: 'UV index jumped from 4.2 to 8.1 in under 15 minutes — possible cloud clearing event. Take precautions.',                                              time: 'Yesterday · 1:15 PM', uvValue: 8.1,  icon: AlertTriangle },
  { id: 5,  severity: 'warning',  title: 'Extended High UV Exposure',    message: 'You have been exposed to UV index above 6 for over 45 continuous minutes. Consider moving to shade.',                                                  time: 'Yesterday · 12:00 PM', uvValue: 7.8, icon: Sun           },
  { id: 6,  severity: 'info',     title: 'Daily UV Summary',             message: "Yesterday's peak UV was 8.7 at 1:00 PM. Total exposure: 2h 30m. SPF was applied twice. Good protection habits!",                                      time: 'Yesterday · 8:00 PM',               icon: Bell          },
  { id: 7,  severity: 'resolved', title: 'UV Returned to Safe Range',    message: 'UV index dropped to 2.1 — low levels. No additional sunscreen needed for the next few hours.',                                                          time: 'Jul 10 · 4:30 PM',   uvValue: 2.1,  icon: CheckCircle   },
  { id: 8,  severity: 'extreme',  title: 'Saturday Extreme UV Event',    message: 'UV index hit 11.8 — highest recorded this season. Daily UV dose limit exceeded. Stay indoors recommended.',                                            time: 'Jul 8 · 12:00 PM',   uvValue: 11.8, icon: Zap           },
  { id: 9,  severity: 'info',     title: 'Device Reconnected',           message: 'UV Shield keychain reconnected after being out of Bluetooth range for 12 minutes. Data sync complete.',                                                time: 'Jul 7 · 3:45 PM',                   icon: Info          },
  { id: 10, severity: 'resolved', title: 'Alert Threshold Updated',      message: 'UV alert threshold changed to 6.0. You will now be notified earlier when UV levels become potentially harmful.',                                        time: 'Jul 5 · 9:00 AM',                   icon: CheckCircle   },
];

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
