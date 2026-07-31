import { getUVZone } from '../constants/uv';

// ─── Log entry type ───────────────────────────────────────────────────────────
import type { UVLogEntry } from '../types/history';

// ─── Log factory ─────────────────────────────────────────────────────────────
function makeLog(i: number): UVLogEntry {
  const base = new Date('2026-07-13T18:00:00');
  base.setMinutes(base.getMinutes() - i * 47);
  const uv = parseFloat((Math.random() * 11.2 + 0.3).toFixed(1));
  return {
    id: i + 1,
    date: base,
    uv,
  };
}

// ─── All logs ─────────────────────────────────────────────────────────────────
export const ALL_LOGS: UVLogEntry[] = Array.from({ length: 72 }, (_, i) => makeLog(i))
  .sort((a, b) => b.date.getTime() - a.date.getTime());

// ─── Table constants ──────────────────────────────────────────────────────────
export const PAGE_SIZE = 14;
export const LEVEL_OPTS = ['All', 'Low', 'Moderate', 'High', 'Very High', 'Extreme'];

// ─── Format helpers ───────────────────────────────────────────────────────────
export function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ─── CSV export ───────────────────────────────────────────────────────────────
export function exportCSV(rows: UVLogEntry[]): void {
  const header = 'Date,Time,UV Index,Level\n';
  const body = rows.map(r => {
    const z = getUVZone(r.uv);
    return `"${fmtDate(r.date)}",${fmtTime(r.date)},${r.uv},${z.label}`;
  }).join('\n');
  const blob = new Blob([header + body], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'uv-history.csv'; a.click();
  URL.revokeObjectURL(url);
}
