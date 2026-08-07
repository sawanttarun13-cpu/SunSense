/**
 * ---------------------------------------------------------
 * File: Analytics.tsx
 * Purpose:
 * React page component for Analytics.
 * ---------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, Legend, AreaChart, Area, ComposedChart,
} from 'recharts';
import { TrendingUp, TrendingDown, Sun, Clock, Calendar } from 'lucide-react';
import { getUVZone } from '../constants/uv';
import { heatFillColor } from '../mockData/analytics';
import { analyticsService } from '../services/analytics.service';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';


// ─── Custom tooltip ───────────────────────────────────────────────────────────
function BarTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-xl text-xs space-y-1">
      <div className="font-semibold text-slate-700">{label}</div>
      {payload.map((p: any, idx: number) => (
        <div key={p.dataKey ?? p.name ?? idx} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-700">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat box ─────────────────────────────────────────────────────────────────
function StatBox({ label, value, sub, color, trend }: { label: string; value: string; sub: string; color: string; trend?: 'up' | 'down' }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
      <div className="text-slate-400 mb-1" style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div className="flex items-end gap-2">
        <div className="font-bold" style={{ fontSize: '1.7rem', color, lineHeight: 1 }}>{value}</div>
        {trend && (
          <div className={`flex items-center gap-0.5 pb-0.5 text-xs font-semibold ${trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend === 'up' ? '+12%' : '-8%'}
          </div>
        )}
      </div>
      <div className="text-slate-400 mt-0.5" style={{ fontSize: '0.7rem' }}>{sub}</div>
    </div>
  );
}

// ─── Analytics page ───────────────────────────────────────────────────────────
// Analytics page shown to the user.
export function Analytics() {
  const [range, setRange] = useState<'week' | 'month'>('week');

  const [weekly, setWeekly] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [peakHours, setPeakHours] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      analyticsService.getWeeklyData(),
      analyticsService.getMonthlyData(),
      analyticsService.getPeakHoursData(),
      analyticsService.getHeatmapData()
    ])
      .then(([w, m, p, h]) => {
        setWeekly(w);
        setMonthly(m);
        setPeakHours(p);
        setHeatmap(h);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  const chartData = range === 'week' ? weekly : monthly;
  const xKey = range === 'week' ? 'day' : 'week';

  return (
    <div className="p-5 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-slate-800 font-semibold" style={{ fontSize: '1.2rem' }}>Analytics</h1>
        <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.8rem' }}>UV exposure trends, peak hours, and heatmap</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        <StatBox label="Weekly Avg UV" value="5.8" sub="This week" color="#F97316" trend="up" />
        <StatBox label="Weekly Max UV" value="11.4" sub="Sat 12:00 PM" color="#EF4444" trend="up" />
        <StatBox label="Daily Avg Exposure" value="2h 40m" sub="This week" color="#3B82F6" />
        <StatBox label="High UV Days" value="4 / 7" sub="This week" color="#9333EA" trend="down" />
      </div>

      {/* UV Overview chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-5" style={{ border: '1px solid #E8F0FE' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-slate-700 font-semibold" style={{ fontSize: '0.85rem' }}>UV Index Overview</h3>
            <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.7rem' }}>Average and maximum UV index per period</p>
          </div>
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
            {(['week', 'month'] as const).map(t => (
              <button
                key={t}
                onClick={() => setRange(t)}
                className="px-4 py-1.5 transition-colors"
                style={{
                  fontSize: '0.75rem', fontWeight: 500,
                  background: range === t ? '#2563EB' : '#fff',
                  color: range === t ? '#fff' : '#64748B',
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <YAxis domain={[0, 13]} tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <Tooltip content={<BarTip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94A3B8', paddingTop: 12 }} />
            <Bar dataKey="avg" name="Average UV" fill="#BFDBFE" radius={[6, 6, 0, 0]} />
            <Bar dataKey="max" name="Max UV" fill="#2563EB" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Peak Hours + Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Peak UV hours */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
          <div className="mb-4">
            <h3 className="text-slate-700 font-semibold" style={{ fontSize: '0.85rem' }}>Peak UV Hours</h3>
            <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.7rem' }}>Average UV by hour of day (7-day)</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={peakHours} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 9 }} interval={3} />
              <YAxis domain={[0, 12]} tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 9 }} />
              <Tooltip content={<BarTip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="uv" name="UV Index" radius={[4, 4, 0, 0]}>
                {peakHours.map((e, i) => (
                  <Cell key={`cell-${i}`} fill={getUVZone(e.uv).color} fillOpacity={0.82} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {[
              { label: 'Low', color: '#22C55E' },
              { label: 'Moderate', color: '#EAB308' },
              { label: 'High', color: '#F97316' },
              { label: 'Very High', color: '#EF4444' },
              { label: 'Extreme', color: '#9333EA' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1" style={{ fontSize: '0.65rem', color: '#64748B' }}>
                <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Monthly area chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
          <div className="mb-4">
            <h3 className="text-slate-700 font-semibold" style={{ fontSize: '0.85rem' }}>6-Week UV Trend</h3>
            <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.7rem' }}>Rolling weekly average & maximum</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={monthly} margin={{ top: 5, right: 10, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="avgFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 9 }} />
              <YAxis domain={[0, 13]} tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 9 }} />
              <Tooltip content={<BarTip />} />
              <Area key="area-avg" type="monotone" dataKey="avg" name="Avg UV" stroke="#3B82F6" strokeWidth={2.5}
                fill="url(#avgFill)" dot={{ fill: '#3B82F6', r: 3.5, stroke: '#fff', strokeWidth: 2 }} />
              <Line key="line-max" type="monotone" dataKey="max" name="Max UV" stroke="#EF4444" strokeWidth={2}
                dot={{ fill: '#EF4444', r: 3, stroke: '#fff', strokeWidth: 2 }} strokeDasharray="5 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-slate-700 font-semibold" style={{ fontSize: '0.85rem' }}>UV Exposure Heatmap</h3>
            <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.7rem' }}>Daily UV intensity — past 91 days</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400" style={{ fontSize: '0.65rem' }}>Less</span>
            {['#F1F5F9', '#86EFAC', '#FDE047', '#FDBA74', '#FCA5A5', '#C4B5FD'].map(c => (
              <div key={c} className="relative group w-3.5 h-3.5 rounded-sm cursor-default" style={{ background: c }}>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 pointer-events-none">
                  <div className="rounded-lg px-2.5 py-1.5 text-white whitespace-nowrap shadow-lg text-center" style={{ background: '#1E293B', fontSize: '0.65rem', lineHeight: 1.5 }}>
                    <div className="font-semibold">
                      {({ '#86EFAC': 'Low', '#FDE047': 'Moderate', '#FDBA74': 'High', '#FCA5A5': 'Very High', '#C4B5FD': 'Extreme' } as Record<string, string>)[c] ?? 'No data'}
                    </div>
                    <div style={{ color: '#94A3B8' }}>
                      {({ '#86EFAC': '≤ 2', '#FDE047': '≤ 5', '#FDBA74': '≤ 7', '#FCA5A5': '≤ 10', '#C4B5FD': '12+' } as Record<string, string>)[c] ?? '—'}
                    </div>
                  </div>
                  <div className="w-2 h-2 mx-auto -mt-1 rotate-45 rounded-sm" style={{ background: '#1E293B' }} />
                </div>
              </div>
            ))}
            <span className="text-slate-400" style={{ fontSize: '0.65rem' }}>More</span>
          </div>
        </div>
        <div className="grid grid-cols-7 sm:grid-cols-13 gap-1.5 overflow-x-auto pb-2">
          {heatmap.map((d, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-md cursor-default transition-transform hover:scale-110"
              style={{ background: heatFillColor(d.uv), opacity: 0.8 + d.uv / 60 }}
              title={`${d.label}: ${d.uv.toFixed(1)} UV`}
            />
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-5">
          {[
            { icon: Sun, color: '#F97316', label: 'Peak recorded', value: '11.4 UV' },
            { icon: Clock, color: '#3B82F6', label: 'Avg peak time', value: '12:30 PM' },
            { icon: Calendar, color: '#9333EA', label: 'High UV days', value: '38 of 91' },
            { icon: TrendingUp, color: '#22C55E', label: 'Safe UV days', value: '53 of 91' },
          ].map(({ icon: Icon, color, label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={14} style={{ color }} />
              <span className="text-slate-400" style={{ fontSize: '0.72rem' }}>{label}:</span>
              <span className="text-slate-700 font-semibold" style={{ fontSize: '0.72rem' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
