import { useState } from 'react';
import { AlertTriangle, Zap, Shield, Bell, Info, CheckCircle, Sun, X } from 'lucide-react';
import { getUVZone } from './Dashboard';

type AlertSeverity = 'extreme' | 'critical' | 'warning' | 'info' | 'resolved';

interface AlertItem {
  id: number;
  severity: AlertSeverity;
  title: string;
  message: string;
  time: string;
  uvValue?: number;
  icon: React.ElementType;
  isNew?: boolean;
}

const ALERT_DATA: AlertItem[] = [
  { id: 1, severity: 'extreme', title: 'Extreme UV Event', message: 'UV index reached 11.4 — extreme levels detected. Seek shade immediately and apply SPF 50+ sunscreen.', time: 'Today · 12:45 PM', uvValue: 11.4, icon: Zap, isNew: true },
  { id: 2, severity: 'critical', title: 'Very High UV Warning', message: 'UV index 9.3. Apply broad-spectrum sunscreen, wear protective clothing and limit sun exposure to 15 minutes.', time: 'Today · 11:30 AM', uvValue: 9.3, icon: AlertTriangle, isNew: true },
  { id: 3, severity: 'warning', title: 'SPF Reapplication Reminder', message: '2 hours have passed since your last sunscreen application. Reapply SPF 30+ now for continued protection.', time: 'Today · 10:00 AM', icon: Shield, isNew: true },
  { id: 4, severity: 'critical', title: 'Rapid UV Spike Detected', message: 'UV index jumped from 4.2 to 8.1 in under 15 minutes — possible cloud clearing event. Take precautions.', time: 'Yesterday · 1:15 PM', uvValue: 8.1, icon: AlertTriangle },
  { id: 5, severity: 'warning', title: 'Extended High UV Exposure', message: 'You have been exposed to UV index above 6 for over 45 continuous minutes. Consider moving to shade.', time: 'Yesterday · 12:00 PM', uvValue: 7.8, icon: Sun },
  { id: 6, severity: 'info', title: 'Daily UV Summary', message: "Yesterday's peak UV was 8.7 at 1:00 PM. Total exposure: 2h 30m. SPF was applied twice. Good protection habits!", time: 'Yesterday · 8:00 PM', icon: Bell },
  { id: 7, severity: 'resolved', title: 'UV Returned to Safe Range', message: 'UV index dropped to 2.1 — low levels. No additional sunscreen needed for the next few hours.', time: 'Jul 10 · 4:30 PM', uvValue: 2.1, icon: CheckCircle },
  { id: 8, severity: 'extreme', title: 'Saturday Extreme UV Event', message: 'UV index hit 11.8 — highest recorded this season. Daily UV dose limit exceeded. Stay indoors recommended.', time: 'Jul 8 · 12:00 PM', uvValue: 11.8, icon: Zap },
  { id: 9, severity: 'info', title: 'Device Reconnected', message: 'UV Shield keychain reconnected after being out of Bluetooth range for 12 minutes. Data sync complete.', time: 'Jul 7 · 3:45 PM', icon: Info },
  { id: 10, severity: 'resolved', title: 'Alert Threshold Updated', message: 'UV alert threshold changed to 6.0. You will now be notified earlier when UV levels become potentially harmful.', time: 'Jul 5 · 9:00 AM', icon: CheckCircle },
];

const SEVERITY_STYLES: Record<AlertSeverity, { bg: string; border: string; iconBg: string; iconColor: string; dotColor: string; badgeBg: string; badgeText: string; label: string }> = {
  extreme: { bg: '#FDF4FF', border: '#D8B4FE', iconBg: '#F3E8FF', iconColor: '#9333EA', dotColor: '#9333EA', badgeBg: '#F3E8FF', badgeText: '#9333EA', label: 'Extreme' },
  critical: { bg: '#FFF1F2', border: '#FECDD3', iconBg: '#FFE4E6', iconColor: '#E11D48', dotColor: '#E11D48', badgeBg: '#FFE4E6', badgeText: '#E11D48', label: 'Critical' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', iconBg: '#FEF3C7', iconColor: '#D97706', dotColor: '#D97706', badgeBg: '#FEF3C7', badgeText: '#D97706', label: 'Warning' },
  info: { bg: '#EFF6FF', border: '#BFDBFE', iconBg: '#DBEAFE', iconColor: '#2563EB', dotColor: '#2563EB', badgeBg: '#DBEAFE', badgeText: '#2563EB', label: 'Info' },
  resolved: { bg: '#F0FDF4', border: '#BBF7D0', iconBg: '#DCFCE7', iconColor: '#16A34A', dotColor: '#22C55E', badgeBg: '#DCFCE7', badgeText: '#16A34A', label: 'Resolved' },
};

const FILTER_TABS: { key: AlertSeverity | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'extreme', label: 'Extreme' },
  { key: 'critical', label: 'Critical' },
  { key: 'warning', label: 'Warning' },
  { key: 'info', label: 'Info' },
  { key: 'resolved', label: 'Resolved' },
];

export function Alerts() {
  const [activeFilter, setActiveFilter] = useState<AlertSeverity | 'all'>('all');
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const visible = ALERT_DATA.filter(a => !dismissed.has(a.id) && (activeFilter === 'all' || a.severity === activeFilter));

  const counts: Record<AlertSeverity, number> = {
    extreme: ALERT_DATA.filter(a => a.severity === 'extreme').length,
    critical: ALERT_DATA.filter(a => a.severity === 'critical').length,
    warning: ALERT_DATA.filter(a => a.severity === 'warning').length,
    info: ALERT_DATA.filter(a => a.severity === 'info').length,
    resolved: ALERT_DATA.filter(a => a.severity === 'resolved').length,
  };
  const activeCount = counts.extreme + counts.critical + counts.warning;

  return (
    <div className="p-5 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-800 font-semibold" style={{ fontSize: '1.2rem' }}>Alerts</h1>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.8rem' }}>UV event notifications and timeline</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <Bell size={14} style={{ color: '#EF4444' }} />
          <span className="font-semibold" style={{ fontSize: '0.78rem', color: '#DC2626' }}>{activeCount} active alerts</span>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-5">
        {(Object.entries(counts) as [AlertSeverity, number][]).map(([sev, count]) => {
          const s = SEVERITY_STYLES[sev];
          return (
            <button
              key={sev}
              onClick={() => setActiveFilter(activeFilter === sev ? 'all' : sev)}
              className="rounded-2xl p-3 text-center transition-all shadow-sm"
              style={{
                background: activeFilter === sev ? s.iconBg : '#fff',
                border: `1.5px solid ${activeFilter === sev ? s.dotColor : '#E8F0FE'}`,
              }}
            >
              <div className="font-bold" style={{ fontSize: '1.4rem', color: s.iconColor }}>{count}</div>
              <div className="font-medium" style={{ fontSize: '0.65rem', color: s.iconColor }}>{s.label}</div>
            </button>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className="flex-shrink-0 rounded-xl px-3 py-1.5 transition-colors"
            style={{
              fontSize: '0.75rem', fontWeight: 500,
              background: activeFilter === key ? '#2563EB' : '#fff',
              color: activeFilter === key ? '#fff' : '#64748B',
              border: `1px solid ${activeFilter === key ? '#2563EB' : '#E2E8F0'}`,
            }}
          >
            {label}
            {key !== 'all' && (
              <span className="ml-1.5 opacity-70">
                ({counts[key as AlertSeverity]})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-2 bottom-2 w-px" style={{ background: 'linear-gradient(to bottom, #BFDBFE, #E2E8F0)' }} />

        <div className="space-y-3">
          {visible.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white rounded-2xl" style={{ border: '1px solid #E8F0FE', fontSize: '0.85rem' }}>
              No alerts match this filter
            </div>
          ) : visible.map((alert) => {
            const s = SEVERITY_STYLES[alert.severity];
            const Icon = alert.icon;
            return (
              <div key={alert.id} className="relative flex gap-4" style={{ paddingLeft: 48 }}>
                {/* Timeline dot */}
                <div
                  className="absolute flex items-center justify-center rounded-full"
                  style={{
                    left: 14, top: 16, width: 24, height: 24,
                    background: s.dotColor, boxShadow: `0 0 0 3px white, 0 0 0 4px ${s.dotColor}22`,
                    zIndex: 10,
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>

                {/* Card */}
                <div
                  className="flex-1 rounded-2xl p-4 shadow-sm transition-shadow hover:shadow-md"
                  style={{ background: s.bg, border: `1.5px solid ${s.border}` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl p-2.5 flex-shrink-0" style={{ background: s.iconBg }}>
                      <Icon size={15} style={{ color: s.iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className="font-semibold text-slate-800" style={{ fontSize: '0.85rem' }}>{alert.title}</span>
                        <span
                          className="rounded-full px-2 py-0.5 font-semibold"
                          style={{ fontSize: '0.65rem', background: s.badgeBg, color: s.badgeText }}
                        >
                          {s.label}
                        </span>
                        {alert.isNew && (
                          <span
                            className="rounded-full px-2 py-0.5 font-bold animate-pulse"
                            style={{ fontSize: '0.6rem', background: '#EF4444', color: '#fff' }}
                          >
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 leading-relaxed" style={{ fontSize: '0.78rem' }}>{alert.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-slate-400" style={{ fontSize: '0.7rem' }}>{alert.time}</span>
                        {alert.uvValue !== undefined && (
                          <span
                            className="rounded-full px-2 py-0.5 font-bold"
                            style={{ fontSize: '0.68rem', background: s.iconBg, color: s.iconColor }}
                          >
                            UV {alert.uvValue}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setDismissed(d => new Set([...d, alert.id]))}
                      className="flex-shrink-0 rounded-lg p-1 transition-colors"
                      style={{ color: '#94A3B8' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      title="Dismiss"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Timeline end */}
          <div className="relative flex gap-4" style={{ paddingLeft: 48 }}>
            <div
              className="absolute flex items-center justify-center rounded-full"
              style={{ left: 14, top: 12, width: 24, height: 24, background: '#E2E8F0', zIndex: 10 }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: '#94A3B8' }} />
            </div>
            <p className="py-3 text-slate-400" style={{ fontSize: '0.78rem' }}>Start of alert history</p>
          </div>
        </div>
      </div>
    </div>
  );
}
