/**
 * ---------------------------------------------------------
 * File: Alerts.tsx
 * Purpose:
 * React page component for Alerts.
 * ---------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import type { AlertSeverity, AlertItem } from '../types/alert';
import { SEVERITY_STYLES, FILTER_TABS } from '../mockData/alerts';
import { alertsService } from '../services/alerts.service';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

// Alerts page shown to the user.
export function Alerts() {
  const [activeFilter, setActiveFilter] = useState<AlertSeverity | 'all'>('all');
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    alertsService.getAlerts()
      .then(data => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, []);

  const visible = alerts.filter(a => !dismissed.has(a.id) && (activeFilter === 'all' || a.severity === activeFilter));

  const counts: Record<AlertSeverity, number> = {
    extreme: alerts.filter(a => a.severity === 'extreme').length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
    resolved: alerts.filter(a => a.severity === 'resolved').length,
  };
  const activeCount = counts.extreme + counts.critical + counts.warning;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

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
