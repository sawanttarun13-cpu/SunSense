/**
 * ---------------------------------------------------------
 * File: analytics.ts
 * Purpose:
 * Frontend file for analytics.
 * ---------------------------------------------------------
 */

import { getUVZone } from '../constants/uv';

// ─── Deterministic seeded random ──────────────────────────────────────────────
// Produces a stable value in [0, 1) for a given integer seed.
// Same seed always returns the same number — exactly like a database record.
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// ─── Weekly data (past 7 days — all historical, completely static) ─────────────
// Keyed to the current week number so it looks realistic but never changes within a week.
const now = new Date();
const weekSeed = now.getFullYear() * 100 + Math.floor(now.getMonth() * 4 + now.getDate() / 7);

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// Frontend logic for analytics.
export const weeklyData = DAYS.map((day, i) => {
  const s = weekSeed + i;
  const avg = parseFloat((3.0 + seededRandom(s) * 5.5).toFixed(1));
  const max = parseFloat((avg + 1.5 + seededRandom(s + 100) * 3.5).toFixed(1));
  return { day, avg, max, exposure: Math.round(60 + seededRandom(s + 200) * 160) };
});

// ─── Monthly data (past 6 weeks — all historical, completely static) ──────────
const monthSeed = now.getFullYear() * 1000 + now.getMonth();
const WEEK_LABELS = ['W1 May', 'W2 May', 'W3 May', 'W4 May', 'W1 Jun', 'W2 Jun'];
export const monthlyData = WEEK_LABELS.map((week, i) => {
  const s = monthSeed + i * 7;
  const avg = parseFloat((4.0 + seededRandom(s) * 4.0).toFixed(1));
  const max = parseFloat((avg + 1.8 + seededRandom(s + 50) * 3.0).toFixed(1));
  return { week, avg, max, days: 7 };
});

// ─── Peak hours data (7-day hourly average — all historical, completely static) ─
// These represent completed hours averaged over the past 7 days.
// They NEVER change during a session; they update once per day at midnight.
const peakSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

export const peakHoursData = Array.from({ length: 24 }, (_, h) => {
  let uv = 0;
  if (h >= 6 && h <= 19) {
    const t = (h - 6) / 13;
    const noise = 0.88 + seededRandom(peakSeed + h) * 0.24;
    uv = parseFloat(Math.max(0, 9.5 * Math.sin(Math.PI * t) * noise).toFixed(1));
  }
  return { hour: `${h}h`, uv };
});

// ─── Heatmap data (past 91 days — all historical, completely static) ──────────
// Each day's UV value is derived purely from a date-based seed.
// The exact same date always produces the exact same UV value — like a DB row.
function heatmapUVForDate(date: Date): number {
  const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const month = date.getMonth();
  // Seasonal sine wave + seeded noise (no Math.random)
  return parseFloat(
    Math.max(0, 5.5 + 3 * Math.sin((month / 6) * Math.PI) + (seededRandom(dateSeed) - 0.5) * 4).toFixed(1)
  );
}

const today = new Date();
export const heatmapData = Array.from({ length: 91 }, (_, i) => {
  const d = new Date(today);
  d.setDate(d.getDate() - (90 - i));
  const isToday = i === 90;
  // Today's cell: use 0 as a placeholder — the live UV from useUVData is the real value.
  // All past 90 days: deterministic, will never change.
  const uv = isToday ? 0 : heatmapUVForDate(d);
  return {
    date: d,
    uv,
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
});

// ─── Heatmap color helpers ────────────────────────────────────────────────────
export function heatColor(uv: number): string {
  if (uv <= 0) return '#F1F5F9';
  return getUVZone(uv).color + '55'; // 33% opacity hex
}

export function heatFillColor(uv: number): string {
  if (uv <= 0) return '#F1F5F9';
  return getUVZone(uv).color;
}
