import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, Legend, AreaChart, Area, ComposedChart,
} from 'recharts';
import { TrendingUp, TrendingDown, Sun, Clock, Calendar } from 'lucide-react';
import { getUVZone } from './Dashboard';

// ─── Mock data ────────────────────────────────────────────────────────────────
const weeklyData = [
  { day: 'Mon', avg: 4.2, max: 7.8, exposure: 95 },
  { day: 'Tue', avg: 6.1, max: 9.3, exposure: 148 },
  { day: 'Wed', avg: 5.8, max: 8.7, exposure: 132 },
  { day: 'Thu', avg: 3.4, max: 6.1, exposure: 72 },
  { day: 'Fri', avg: 7.2, max: 10.1, exposure: 175 },
  { day: 'Sat', avg: 8.5, max: 11.4, exposure: 210 },
  { day: 'Sun', avg: 6.9, max: 9.8, exposure: 165 },
];

const monthlyData = [
  { week: 'W1 Jun', avg: 5.1, max: 8.9, days: 7 },
  { week: 'W2 Jun', avg: 6.3, max: 10.2, days: 7 },
  { week: 'W3 Jun', avg: 4.8, max: 7.6, days: 7 },
  { week: 'W4 Jun', avg: 7.1, max: 11.4, days: 7 },
  { week: 'W1 Jul', avg: 5.9, max: 9.1, days: 7 },
  { week: 'W2 Jul', avg: 6.7, max: 10.8, days: 6 },
];

const peakHoursData = Array.from({ length: 24 }, (_, h) => {
  let uv = 0;
  if (h >= 6 && h <= 19) {
    const t = (h - 6) / 13;
    uv = Math.max(0, parseFloat((9.5 * Math.sin(Math.PI * t) * (0.88 + Math.random() * 0.24)).toFixed(1)));
  }
  return { hour: `${h}h`, uv };
});

// Heatmap: 91 days
function makeHeatmap() {
  const today = new Date();
  return Array.from({ length: 91 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (90 - i));
    const month = d.getMonth();
    const uv = Math.max(0, parseFloat((5.5 + 3 * Math.sin(month / 6 * Math.PI) + (Math.random() - 0.5) * 4).toFixed(1)));
    return { date: d, uv, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
  });
}
const heatmapData = makeHeatmap();

function heatColor(uv: number) {
  if (uv <= 0) return '#F1F5F9';
  const z = getUVZone(uv);
  return z.color + '55'; // 33% opacity hex
}
function heatFillColor(uv: number) {
  if (uv <= 0) return '#F1F5F9';
  return getUVZone(uv).color;
}

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
export function Analytics() {
  const [tab, setTab] = useState<'weekly' | 'monthly'>('weekly');
  const chartData = tab === 'weekly' ? weeklyData : monthlyData;
  const xKey = tab === 'weekly' ? 'day' : 'week';

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
            {(['weekly', 'monthly'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-1.5 transition-colors"
                style={{
                  fontSize: '0.75rem', fontWeight: 500,
                  background: tab === t ? '#2563EB' : '#fff',
                  color: tab === t ? '#fff' : '#64748B',
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
            <BarChart data={peakHoursData} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 9 }} interval={3} />
              <YAxis domain={[0, 12]} tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 9 }} />
              <Tooltip content={<BarTip />} />
              <Bar dataKey="uv" name="UV Index" radius={[4, 4, 0, 0]}>
                {peakHoursData.map((e, i) => (
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
            <ComposedChart data={monthlyData} margin={{ top: 5, right: 10, left: -28, bottom: 0 }}>
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
              <div key={c} className="w-3.5 h-3.5 rounded-sm" style={{ background: c }} />
            ))}
            <span className="text-slate-400" style={{ fontSize: '0.65rem' }}>More</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {heatmapData.map(({ date, uv, label }, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-md cursor-default transition-transform hover:scale-110"
              style={{ background: heatFillColor(uv), opacity: 0.8 + uv / 60 }}
              title={`${label} — UV ${uv}`}
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
