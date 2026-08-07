/**
 * ---------------------------------------------------------
 * File: ChartTooltip.tsx
 * Purpose:
 * React component for ChartTooltip.
 * ---------------------------------------------------------
 */

import { getUVZone } from '../../constants/uv';

// ─── Recharts custom tooltip for UV charts ────────────────────────────────────
// Reusable ChartTooltip component.
export function ChartTooltip({ active, payload, label }: any) {
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
