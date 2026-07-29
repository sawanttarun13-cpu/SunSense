import React from 'react';
import { getUVZone } from '../../utils/uv';

const polarToCartesian = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

export function UVGauge({ value }: { value: number }) {
  const cx = 130, cy = 150, r = 100, sw = 14;
  const arcLen = Math.PI * r; 

  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  const fraction = Math.min(Math.max(value / 12, 0), 1);
  const progressLen = fraction * arcLen;

  const arcStart = 270; 
  
  const zone = getUVZone(value);

  const tickUVs = [0, 2, 5, 7, 10, 12];
  const ticks = tickUVs.map(uv => {
    const a = arcStart + (uv / 12) * 180;
    const inner = polarToCartesian(cx, cy, r - 8, a);
    const outer = polarToCartesian(cx, cy, r + 8, a);
    return { uv, inner, outer };
  });

  return (
    <svg viewBox="0 0 260 200" style={{ width: '100%', maxWidth: 280, overflow: 'visible' }}>
      <defs>
        <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <path d={arcPath} fill="none" stroke="#F1F5F9" strokeWidth={sw} strokeLinecap="round" />

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

      {ticks.map(({ uv, inner, outer }) => (
        <line
          key={`tick-${uv}`}
          x1={inner.x.toFixed(2)} y1={inner.y.toFixed(2)}
          x2={outer.x.toFixed(2)} y2={outer.y.toFixed(2)}
          stroke="#CBD5E1" strokeWidth={1} opacity={0.5}
        />
      ))}

      <text x={cx} y={cy - 10} textAnchor="middle" fontSize={48} fontWeight={700}
        fill="#1E293B" fontFamily="Poppins, sans-serif" style={{ transition: 'fill 0.4s' }}>
        {value.toFixed(1)}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={10} fill="#94A3B8" fontWeight={600}
        fontFamily="Poppins, sans-serif" style={{ letterSpacing: '0.05em' }}>
        UV INDEX
      </text>

      <rect x={cx - 35} y={cy + 22} width={70} height={18} rx={9}
        fill={zone.bg} stroke={zone.border} strokeWidth={1} />
      <text x={cx} y={cy + 34} textAnchor="middle" fontSize={10} fontWeight={600}
        fill={zone.text} fontFamily="Poppins, sans-serif">
        {zone.label}
      </text>
    </svg>
  );
}
