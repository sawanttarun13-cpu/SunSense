import { getUVZone } from '../constants/uv';

// ─── Weekly data ──────────────────────────────────────────────────────────────
export const weeklyData = [
  { day: 'Mon', avg: 4.2, max: 7.8,  exposure: 95  },
  { day: 'Tue', avg: 6.1, max: 9.3,  exposure: 148 },
  { day: 'Wed', avg: 5.8, max: 8.7,  exposure: 132 },
  { day: 'Thu', avg: 3.4, max: 6.1,  exposure: 72  },
  { day: 'Fri', avg: 7.2, max: 10.1, exposure: 175 },
  { day: 'Sat', avg: 8.5, max: 11.4, exposure: 210 },
  { day: 'Sun', avg: 6.9, max: 9.8,  exposure: 165 },
];

// ─── Monthly data ─────────────────────────────────────────────────────────────
export const monthlyData = [
  { week: 'W1 Jun', avg: 5.1, max: 8.9,  days: 7 },
  { week: 'W2 Jun', avg: 6.3, max: 10.2, days: 7 },
  { week: 'W3 Jun', avg: 4.8, max: 7.6,  days: 7 },
  { week: 'W4 Jun', avg: 7.1, max: 11.4, days: 7 },
  { week: 'W1 Jul', avg: 5.9, max: 9.1,  days: 7 },
  { week: 'W2 Jul', avg: 6.7, max: 10.8, days: 6 },
];

// ─── Peak hours data (24h) ────────────────────────────────────────────────────
export const peakHoursData = Array.from({ length: 24 }, (_, h) => {
  let uv = 0;
  if (h >= 6 && h <= 19) {
    const t = (h - 6) / 13;
    uv = Math.max(0, parseFloat((9.5 * Math.sin(Math.PI * t) * (0.88 + Math.random() * 0.24)).toFixed(1)));
  }
  return { hour: `${h}h`, uv };
});

// ─── Heatmap data (91 days) ───────────────────────────────────────────────────
function makeHeatmap() {
  const today = new Date();
  return Array.from({ length: 91 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (90 - i));
    const month = d.getMonth();
    const uv = Math.max(0, parseFloat((5.5 + 3 * Math.sin(month / 6 * Math.PI) + (Math.random() - 0.5) * 4).toFixed(1)));
    return { date: d, uv, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
  });
}
export const heatmapData = makeHeatmap();

// ─── Heatmap color helpers ────────────────────────────────────────────────────
export function heatColor(uv: number): string {
  if (uv <= 0) return '#F1F5F9';
  return getUVZone(uv).color + '55'; // 33% opacity hex
}

export function heatFillColor(uv: number): string {
  if (uv <= 0) return '#F1F5F9';
  return getUVZone(uv).color;
}
