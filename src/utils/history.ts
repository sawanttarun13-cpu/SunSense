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

export function isToday(d: Date | string): boolean {
  const date = typeof d === 'string' ? new Date(d) : d;
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

export function fmtDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ─── CSV export ───────────────────────────────────────────────────────────────
export function exportCSV(rows: UVLogEntry[]): void {
  const header = 'Date,Time,Average UV Index,Minimum UV Index,Maximum UV Index,Samples,Level\n';
  const body = rows.map(r => {
    const z = getUVZone(r.uvIndex);
    const minUv = r.minimumUvIndex !== undefined ? r.minimumUvIndex : r.uvIndex;
    const maxUv = r.maximumUvIndex !== undefined ? r.maximumUvIndex : r.uvIndex;
    const samples = r.sampleCount !== undefined ? r.sampleCount : 1;
    return `"${fmtDate(r.recordedAt)}",${fmtTime(r.recordedAt)},${r.uvIndex.toFixed(2)},${minUv.toFixed(2)},${maxUv.toFixed(2)},${samples},${z.label}`;
  }).join('\n');
  const blob = new Blob([header + body], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'uv-history.csv'; a.click();
  URL.revokeObjectURL(url);
}
