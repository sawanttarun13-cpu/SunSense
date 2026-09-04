/**
 * ---------------------------------------------------------
 * File: Alerts.tsx
 * Purpose:
 * React page component for Alerts.
 * ---------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Zap, Shield, Info, CheckCircle } from 'lucide-react';
import type { AlertSeverity } from '../types/alert';
import { SEVERITY_STYLES, FILTER_TABS } from '../constants/alerts';
import { alertsService, PaginatedAlerts } from '../services/alerts.service';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { useSocketEvent } from '../hooks/useSocketEvent';
import { useCallback } from 'react';

const getAlertIcon = (severity: string) => {
  switch (severity) {
    case 'extreme': return Zap;
    case 'critical': return AlertTriangle;
    case 'warning': return Shield;
    case 'resolved': return CheckCircle;
    case 'info':
    default: return Info;
  }
};

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

// Alerts page shown to the user.
export function Alerts() {
  const [activeFilter, setActiveFilter] = useState<AlertSeverity | 'all'>('all');
  const [alertsData, setAlertsData] = useState<PaginatedAlerts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAlerts = useCallback((status = 'all') => {
    setLoading(true);
    alertsService.getAlerts(1, 100, status)
      .then(data => {
        setAlertsData(data);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    fetchAlerts(activeFilter);
  }, [activeFilter, fetchAlerts]);

  // Handle incoming real-time alerts silently
  useSocketEvent('alert:new', useCallback(() => {
    // We refetch silently without setting loading to true, so it doesn't flicker
    alertsService.getAlerts(1, 100, activeFilter)
      .then(data => setAlertsData(data))
      .catch(console.error);
  }, [activeFilter]));

  const handleDismiss = async (id: string) => {
    try {
      await alertsService.markRead(id);
      // Optimistically update UI by marking read
      setAlertsData(prev => prev ? {
        ...prev,
        data: prev.data.map(a => a.id === id ? { ...a, isRead: true } : a)
      } : null);
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await alertsService.deleteAlert(id);
      // Optimistically remove from UI
      setAlertsData(prev => prev ? {
        ...prev,
        data: prev.data.filter(a => a.id !== id)
      } : null);
    } catch (e) {
      console.error('Failed to delete alert', e);
    }
  };

  if (loading && !alertsData) return <LoadingState />;
  if (error) return <ErrorState onRetry={() => fetchAlerts(activeFilter)} />;

  const allAlerts = alertsData?.data || [];
  const alerts = activeFilter === 'all' 
    ? allAlerts 
    : allAlerts.filter(a => a.severity === activeFilter);
  
  // Just derive counts from visible if API filtering is applied, or if API doesn't return total breakdown
  // Note: Since we fetch based on filter, we only have counts for the currently fetched alerts.
  // To keep it simple, we just show the total we got from pagination.
  const activeCount = allAlerts.filter(a => !a.isRead).length;

  return (
    <div className="p-5 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-slate-800 font-semibold" style={{ fontSize: '1.2rem' }}>Alerts</h1>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.8rem' }}>UV event notifications and timeline</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-shrink-0" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <Bell size={14} style={{ color: '#EF4444' }} />
          <span className="font-semibold" style={{ fontSize: '0.78rem', color: '#DC2626' }}>{activeCount} unread alerts</span>
        </div>
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
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {alerts.length > 0 && <div className="absolute left-6 top-2 bottom-2 w-px" style={{ background: 'linear-gradient(to bottom, #BFDBFE, #E2E8F0)' }} />}

        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white rounded-2xl" style={{ border: '1px solid #E8F0FE', fontSize: '0.85rem' }}>
              No alerts match this filter. You're all caught up!
            </div>
          ) : alerts.map((alert) => {
            const severityKey = alert.severity as AlertSeverity;
            const s = SEVERITY_STYLES[severityKey] || SEVERITY_STYLES['info'];
            const Icon = getAlertIcon(alert.severity);
            return (
              <div key={alert.id} className={`relative flex gap-4 ${alert.isRead ? 'opacity-70' : ''}`} style={{ paddingLeft: 48 }}>
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
                  className="flex-1 rounded-2xl p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border"
                  style={{ 
                    background: s.bg, 
                    borderColor: s.border,
                    boxShadow: alert.isRead ? 'none' : `0 4px 20px -2px ${s.iconBg}`
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl p-2.5 flex-shrink-0" style={{ background: s.iconBg }}>
                      <Icon size={15} style={{ color: s.iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className="font-semibold text-slate-800" style={{ fontSize: '0.9rem' }}>{alert.title}</span>
                        <span
                          className="rounded-full px-2.5 py-0.5 font-bold tracking-wide uppercase"
                          style={{ fontSize: '0.65rem', background: s.badgeBg, color: s.badgeText, border: `1px solid ${s.border}` }}
                        >
                          {s.label}
                        </span>
                        {!alert.isRead && (
                          <span
                            className="rounded-full px-2 py-0.5 font-bold tracking-wide uppercase animate-pulse shadow-sm"
                            style={{ fontSize: '0.6rem', background: '#EF4444', color: '#fff', boxShadow: '0 0 10px rgba(239,68,68,0.4)' }}
                          >
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 leading-relaxed mt-1" style={{ fontSize: '0.85rem' }}>{alert.message}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-slate-400 font-medium tracking-wide" style={{ fontSize: '0.75rem' }}>{formatTime(alert.triggeredAt)}</span>
                        {alert.uvValue !== undefined && alert.uvValue !== null && (
                          <span
                            className="rounded-full px-2.5 py-0.5 font-bold tracking-wide shadow-sm"
                            style={{ fontSize: '0.7rem', background: s.iconBg, color: s.iconColor, border: `1px solid ${s.border}` }}
                          >
                            UV {alert.uvValue.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="flex-shrink-0 rounded-lg p-1 transition-colors hover:text-red-500"
                        style={{ color: '#94A3B8' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        title="Delete Alert"
                      >
                        <X size={16} />
                      </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Timeline end */}
          {alerts.length > 0 && (
            <div className="relative flex gap-4" style={{ paddingLeft: 48 }}>
              <div
                className="absolute flex items-center justify-center rounded-full"
                style={{ left: 14, top: 12, width: 24, height: 24, background: '#E2E8F0', zIndex: 10 }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: '#94A3B8' }} />
              </div>
              <p className="py-3 text-slate-400" style={{ fontSize: '0.78rem' }}>Start of alert history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
