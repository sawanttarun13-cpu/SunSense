import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function StatCard({
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
