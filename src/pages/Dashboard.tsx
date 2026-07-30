import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  Battery, Wifi, Shield, Clock, Activity, AlertTriangle,
  Sun, Zap, ChevronUp, ChevronDown,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { UVGauge } from '../components/common/UVGauge';
import { MiniMetric } from '../components/common/MiniMetric';
import { UV_ZONES } from '../constants/uv';
import { useUVData } from '../hooks/useUVData';
import { ChartTooltip } from '../components/charts/ChartTooltip';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardStat } from '../types/dashboard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

import { useNavigate } from 'react-router';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function Dashboard() {
  const navigate = useNavigate();
  const { uvValue, hourlyData, zone } = useUVData();
  const now = new Date();

  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [metrics, setMetrics] = useState({ peakUV: '', peakTime: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      dashboardService.getMetrics()
    ])
      .then(([statsData, metricsData]) => {
        setStats(statsData);
        setMetrics(metricsData);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <div className="p-5 md:p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-800 font-semibold" style={{ fontSize: '1.2rem' }}>Dashboard</h1>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.8rem' }}>
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-1.5"
          style={{ background: '#fff', border: '1px solid #E8F0FE', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-slate-600" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
            Live · {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        {stats.map(s => (
          <StatCard key={s.id} {...s} />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
        {/* Gauge card */}
        <div
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden transition-all duration-500"
          style={{
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/history')}
          title="View history"
        >
          {/* Subtle background glow based on UV intensity */}
          <div
            className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full -mr-16 -mt-16 transition-colors duration-1000"
            style={{ background: zone.color }}
          />

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <span className="text-slate-800 font-bold tracking-tight" style={{ fontSize: '0.95rem' }}>UV Intensity</span>
              <p className="text-slate-400 text-[0.65rem] uppercase tracking-widest font-medium mt-0.5">Real-time sensor</p>
            </div>
            <div className="flex flex-col items-end">
              <span
                className="px-3 py-1 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider shadow-sm transition-all duration-500"
                style={{ background: zone.color, color: 'white' }}
              >
                {zone.label}
              </span>
              <span className="text-slate-400 text-[0.6rem] mt-1 font-medium">Updated just now</span>
            </div>
          </div>

          <div className="flex justify-center my-4 relative z-10">
            <UVGauge value={uvValue} />
          </div>

          {/* Professional Metric Grid */}
          <div className="mt-8 grid grid-cols-3 gap-4 relative z-10">
            {[
              { label: 'Low', val: '0.0', color: '#22C55E', sub: 'Baseline' },
              { label: 'Live', val: uvValue.toFixed(1), color: zone.color, sub: 'Current', active: true },
              { label: 'Peak', val: metrics.peakUV, color: '#EF4444', sub: metrics.peakTime },
            ].map(({ label, val, color, sub, active }) => (
              <div
                key={label}
                className={`rounded-2xl p-3 text-center border transition-all duration-500 ${active ? 'bg-white shadow-md' : 'bg-slate-50/50'}`}
                style={{ borderColor: active ? zone.border : '#F1F5F9' }}
              >
                <div className="text-slate-400 font-bold tracking-tighter" style={{ fontSize: '0.55rem', textTransform: 'uppercase' }}>{label}</div>
                <div className="font-bold mt-1 tracking-tight" style={{ fontSize: '1.25rem', color: active ? color : '#1E293B' }}>{val}</div>
                <div className="text-slate-400 font-medium mt-0.5" style={{ fontSize: '0.55rem' }}>{sub}</div>
                {active && (
                  <div className="h-1 w-4 mx-auto mt-2 rounded-full" style={{ background: color }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* UV recommendation banner */}
          <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: zone.bg, border: `1.5px solid ${zone.border}` }}>
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20" style={{ background: zone.color }} />
            <div className="flex items-center gap-3 relative z-10">
              <div className="rounded-xl p-3 flex-shrink-0" style={{ background: zone.border }}>
                <Sun size={20} style={{ color: zone.text }} />
              </div>
              <div className="flex-1">
                <div className="font-semibold" style={{ fontSize: '0.85rem', color: zone.text }}>
                  {zone.label === 'Low' ? 'UV levels are low — enjoy the sun!' :
                    zone.label === 'Moderate' ? 'Apply SPF 30+ before going out.' :
                      zone.label === 'High' ? 'SPF 50 recommended. Limit exposure.' :
                        zone.label === 'Very High' ? 'Seek shade! Wear protective clothing.' :
                          'Extreme UV! Stay indoors if possible.'}
                </div>
                <div className="text-slate-500 mt-0.5" style={{ fontSize: '0.72rem' }}>
                  Reapply sunscreen every 2 hours · Avoid 10AM–4PM exposure
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold" style={{ fontSize: '2rem', color: zone.text, lineHeight: 1 }}>{uvValue.toFixed(1)}</div>
                <div className="text-slate-400" style={{ fontSize: '0.65rem' }}>UV now</div>
              </div>
            </div>
          </div>

          {/* 4-box mini metrics */}
          <div className="grid grid-cols-2 gap-3">
            <MiniMetric label="Peak UV Today" value={metrics.peakUV} bar={(parseFloat(metrics.peakUV) / 12) * 100} barColor="#EF4444" />
            <MiniMetric label="UV Dose (SED)" value="18.4" bar={70} barColor="#F97316" />
            <MiniMetric label="Burn Time Left" value="24 min" bar={35} barColor="#9333EA" />
            <MiniMetric label="Active Alerts" value="3" bar={60} barColor="#EF4444" onClick={() => navigate('/alerts')} />
          </div>
        </div>
      </div>

      {/* Real-time line chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-slate-700 font-semibold" style={{ fontSize: '0.85rem' }}>Today's UV Timeline</h3>
            <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.72rem' }}>Hourly readings — auto-refreshes every 4s</p>
          </div>
          <div className="flex items-center gap-3">
            {[
              { color: '#F97316', label: 'High (6+)' },
              { color: '#EF4444', label: 'Very High (8+)' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="h-px w-5" style={{ borderTop: `2px dashed ${color}` }} />
                <span className="text-slate-400" style={{ fontSize: '0.65rem' }}>{label}</span>
              </div>
            ))}
            <div
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse block" />
              <span className="text-red-600 font-semibold" style={{ fontSize: '0.65rem' }}>LIVE</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={hourlyData} margin={{ top: 5, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="uvFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="hour" tickLine={false} axisLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'Poppins' }} interval={3} />
            <YAxis domain={[0, 12]} tickLine={false} axisLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'Poppins' }} />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine key="ref-uv-6" y={6} stroke="#F97316" strokeDasharray="5 4" strokeWidth={1.5} opacity={0.7} />
            <ReferenceLine key="ref-uv-8" y={8} stroke="#EF4444" strokeDasharray="5 4" strokeWidth={1.5} opacity={0.7} />
            <Area
              type="monotone" dataKey="uv" name="UV Index" stroke="#3B82F6" strokeWidth={2.5}
              fill="url(#uvFill)" dot={false}
              activeDot={{ r: 5, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Zone color legend */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
          {UV_ZONES.map((z, idx) => (
            <div key={`legend-${z.label}-${idx}`} className="flex-1 rounded py-1 text-center" style={{ background: z.bg }}>
              <div className="w-2 h-2 rounded-full mx-auto mb-0.5" style={{ background: z.color }} />
              <div style={{ fontSize: '0.6rem', color: z.text, fontWeight: 600 }}>{z.label}</div>
              <div style={{ fontSize: '0.55rem', color: '#94A3B8' }}>≤{z.max === Infinity ? '12+' : z.max}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
