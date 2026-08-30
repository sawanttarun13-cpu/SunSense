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

export function fmtDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ─── CSV export ───────────────────────────────────────────────────────────────
export function exportCSV(rows: UVLogEntry[]): void {
  const header = 'Date,Time,UV Index,Level\n';
  const body = rows.map(r => {
    const z = getUVZone(r.uvIndex);
    return `"${fmtDate(r.recordedAt)}",${fmtTime(r.recordedAt)},${r.uvIndex},${z.label}`;
  }).join('\n');
  const blob = new Blob([header + body], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'uv-history.csv'; a.click();
  URL.revokeObjectURL(url);
}
