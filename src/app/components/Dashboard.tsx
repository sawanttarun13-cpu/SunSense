import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  Battery, Wifi, Shield, Clock, Activity, AlertTriangle,
  Sun, Zap, ChevronUp, ChevronDown,
} from 'lucide-react';

// ─── UV helpers ───────────────────────────────────────────────────────────────
export const UV_ZONES = [
  { max: 2, label: 'Low', color: '#22C55E', bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A' },
  { max: 5, label: 'Moderate', color: '#EAB308', bg: '#FEFCE8', border: '#FDE68A', text: '#CA8A04' },
  { max: 7, label: 'High', color: '#F97316', bg: '#FFF7ED', border: '#FED7AA', text: '#EA580C' },
  { max: 10, label: 'Very High', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' },
  { max: Infinity, label: 'Extreme', color: '#9333EA', bg: '#FAF5FF', border: '#E9D5FF', text: '#9333EA' },
];
export const getUVZone = (v: number) => UV_ZONES.find(z => v <= z.max) ?? UV_ZONES[4];

// ─── Animated SVG Gauge ───────────────────────────────────────────────────────
const polarToCartesian = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

function UVGauge({ value }: { value: number }) {
  const cx = 130, cy = 150, r = 100, sw = 14;
  // Semi-circle: 180° sweep from 180° (left) to 0° (right)
  const arcLen = Math.PI * r; 

  const startPt = polarToCartesian(cx, cy, r, 270); // 180 deg
  const endPt   = polarToCartesian(cx, cy, r, 90);  // 0 deg
  // Simple semi-circle arc path
  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  const fraction = Math.min(Math.max(value / 12, 0), 1);
  const progressLen = fraction * arcLen;

  // Indicator dot position - simple 180 degree rotation from 180 to 0 (clockwise)
  // 180 index on left, 0 on right. 
  // Wait, polarToCartesian 0 is right? Usually 0 is up or right.
  // Let's re-verify the helper: rad = ((deg - 90) * Math.PI) / 180
  // deg 180 -> rad = 90 deg (down?) No.
  // Let's use standard angles for clarity: 180 (left) -> 360 (right)
  const arcStart = 270; // 180 degrees left
  const arcEnd = 90; // 0 degrees right
  const dotAngle = arcStart + (fraction * 180);
  const dot = polarToCartesian(cx, cy, r, dotAngle);

  const zone = getUVZone(value);

  // Zone boundary ticks at UV 0, 2, 5, 7, 10, 12
  const tickUVs = [0, 2, 5, 7, 10, 12];
  const ticks = tickUVs.map(uv => {
    const a = arcStart + (uv / 12) * 180;
    const inner = polarToCartesian(cx, cy, r - 8, a);
    const outer = polarToCartesian(cx, cy, r + 8, a);
    return { uv, inner, outer };
  });

  return (
    <svg viewBox="0 0 260 180" style={{ width: '100%', maxWidth: 280 }}>
      <defs>
        <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background track (gray) */}
      <path d={arcPath} fill="none" stroke="#F1F5F9" strokeWidth={sw} strokeLinecap="round" />

      {/* Progress arc */}
      <path
        d={arcPath}
        fill="none"
        stroke={zone.color}
        strokeWidth={sw}
        strokeLinecap="round"
        filter="url(#arcGlow)"
        style={{
          strokeDasharray: `${progressLen.toFixed(2)} ${arcLen.toFixed(2)}`,
          transition: 'stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1), stroke 0.4s ease',
        }}
      />

      {/* Tick marks (simplified) */}
      {ticks.map(({ uv, inner, outer }) => (
        <line
          key={`tick-${uv}`}
          x1={inner.x.toFixed(2)} y1={inner.y.toFixed(2)}
          x2={outer.x.toFixed(2)} y2={outer.y.toFixed(2)}
          stroke="#CBD5E1" strokeWidth={1} opacity={0.5}
        />
      ))}

      {/* Center: UV number */}
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize={48} fontWeight={700}
        fill="#1E293B" fontFamily="Poppins, sans-serif" style={{ transition: 'fill 0.4s' }}>
        {value.toFixed(1)}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={10} fill="#94A3B8" fontWeight={600}
        fontFamily="Poppins, sans-serif" style={{ letterSpacing: '0.05em' }}>
        UV INDEX
      </text>

      {/* Level badge */}
      <rect x={cx - 35} y={cy + 22} width={70} height={18} rx={9}
        fill={zone.bg} stroke={zone.border} strokeWidth={1} />
      <text x={cx} y={cy + 34} textAnchor="middle" fontSize={10} fontWeight={600}
        fill={zone.text} fontFamily="Poppins, sans-serif">
        {zone.label}
      </text>
    </svg>
  );
}

// ─── Hourly data generator ────────────────────────────────────────────────────
function generateHourly() {
  const hour = new Date().getHours();
  return Array.from({ length: 24 }, (_, h) => {
    let uv = 0;
    if (h >= 6 && h <= 19) {
      const t = (h - 6) / 13;
      uv = Math.max(0, 9.8 * Math.sin(Math.PI * t) * (0.82 + Math.random() * 0.36));
      uv = parseFloat(uv.toFixed(1));
    }
    return { hour: `${String(h).padStart(2, '0')}:00`, uv, isCurrent: h === hour };
  });
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value as number;
  const z = getUVZone(v);
  return (
    <div className="bg-white border rounded-xl px-3 py-2 shadow-xl text-xs" style={{ borderColor: z.border }}>
      <div className="text-slate-400 mb-0.5">{label}</div>
      <div className="font-semibold" style={{ color: z.color }}>UV {v.toFixed(1)} · {z.label}</div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, delta, iconColor, iconBg,
}: {
  icon: React.ElementType; label: string; value: string; sub: string;
  delta?: { dir: 'up' | 'down'; val: string }; iconColor: string; iconBg: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-3 items-start" style={{ border: '1px solid #E8F0FE' }}>
      <div className="rounded-xl p-2.5 flex-shrink-0" style={{ background: iconBg }}>
        <Icon size={17} style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        <div className="text-slate-400" style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
        <div className="text-slate-800 font-semibold mt-0.5" style={{ fontSize: '0.95rem' }}>{value}</div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-slate-400" style={{ fontSize: '0.7rem' }}>{sub}</span>
          {delta && (
            <span
              className="flex items-center gap-0.5 font-medium"
              style={{ fontSize: '0.65rem', color: delta.dir === 'up' ? '#EF4444' : '#22C55E' }}
            >
              {delta.dir === 'up' ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              {delta.val}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mini metric ─────────────────────────────────────────────────────────────
function MiniMetric({ label, value, bar, barColor }: { label: string; value: string; bar: number; barColor: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
      <div className="text-slate-400 mb-1" style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div className="text-slate-800 font-bold mb-2.5" style={{ fontSize: '1.5rem' }}>{value}</div>
      <div className="h-1.5 rounded-full bg-slate-100">
        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${bar}%`, background: barColor }} />
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function Dashboard() {
  const [uvValue, setUvValue] = useState(7.2);
  const [hourlyData, setHourlyData] = useState(generateHourly);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setUvValue(prev => {
        const next = Math.min(11, Math.max(0.1, +(prev + (Math.random() - 0.48) * 0.5).toFixed(1)));
        return next;
      });
      setHourlyData(generateHourly());
      setTick(t => t + 1);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const zone = getUVZone(uvValue);
  const now = new Date();

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
        <StatCard icon={Battery} label="Battery" value="82%" sub="~14h left" iconColor="#2563EB" iconBg="#EFF6FF" />
        <StatCard icon={Wifi} label="Status" value="Connected" sub="Strong signal" iconColor="#22C55E" iconBg="#F0FDF4" />
        <StatCard icon={Clock} label="UV Exposure" value="2h 15m" sub="Today · since 6 AM" delta={{ dir: 'up', val: '+18m' }} iconColor="#F97316" iconBg="#FFF7ED" />
        <StatCard icon={Shield} label="SPF Status" value="SPF 50" sub="Recommended now" iconColor="#9333EA" iconBg="#FAF5FF" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
        {/* Gauge card */}
        <div
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden transition-all duration-500"
          style={{ 
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
          }}
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
              { label: 'Peak', val: '9.3', color: '#EF4444', sub: '1:42 PM' },
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
            <MiniMetric label="Peak UV Today" value="9.3" bar={(9.3/12)*100} barColor="#EF4444" />
            <MiniMetric label="UV Dose (SED)" value="18.4" bar={70} barColor="#F97316" />
            <MiniMetric label="Burn Time Left" value="24 min" bar={35} barColor="#9333EA" />
            <MiniMetric label="Active Alerts" value="3" bar={60} barColor="#EF4444" />
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
