import { getUVZone } from '../constants/uv';
import type { UVLogEntry } from '../types/history';

// ─── Table constants ──────────────────────────────────────────────────────────
export const PAGE_SIZE = 14;

// ─── Format helpers ───────────────────────────────────────────────────────────
export function fmtDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function fmtTime(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
