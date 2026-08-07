/**
 * ---------------------------------------------------------
 * File: MiniMetric.tsx
 * Purpose:
 * React component for MiniMetric.
 * ---------------------------------------------------------
 */

import React from 'react';

// Reusable MiniMetric component.
export function MiniMetric({ label, value, bar, barColor, onClick }: { label: string; value: string; bar: number; barColor: string; onClick?: () => void }) {
  return (
    <div
      className="bg-white rounded-2xl p-4 shadow-sm transition-all duration-150"
      style={{ border: '1px solid #E8F0FE', cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(37,99,235,0.10)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
    >
      <div className="text-slate-400 mb-1" style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div className="text-slate-800 font-bold mb-2.5" style={{ fontSize: '1.5rem' }}>{value}</div>
      <div className="h-1.5 rounded-full bg-slate-100">
        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${bar}%`, background: barColor }} />
      </div>
    </div>
  );
}
