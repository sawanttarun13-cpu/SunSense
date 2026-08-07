/**
 * ---------------------------------------------------------
 * File: history.ts
 * Purpose:
 * Frontend file for history.
 * ---------------------------------------------------------
 */

import { getUVZone } from '../constants/uv';
import type { UVLogEntry } from '../types/history';

// ─── Deterministic seeded random ──────────────────────────────────────────────
// Same seed → same value, always. Simulates stable database records.
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// ─── Log factory (deterministic) ──────────────────────────────────────────────
// Each log entry is anchored to a fixed past timestamp.
// The UV value is derived from a seed based on the entry index — never random.
// This matches how PostgreSQL rows would look: fixed id, fixed timestamp, fixed reading.
function makeLog(i: number): UVLogEntry {
  const base = new Date('2026-07-13T18:00:00');
  base.setMinutes(base.getMinutes() - i * 47);
  // Seeded UV: index i always gives the same UV value across refreshes
  const uv = parseFloat((seededRandom(i + 1) * 11.2 + 0.3).toFixed(1));
  return {
    id: i + 1,
    date: base,
    uv,
  };
}

// ─── All logs (immutable after generation) ────────────────────────────────────
// Generated ONCE at module load. Because seededRandom is deterministic,
// every app reload produces the exact same 72 rows — like querying a DB.
// Frontend logic for history.
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
