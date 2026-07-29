import type { UVZone } from '../types/uv';

// ─── UV zone definitions ───────────────────────────────────────────────────────
export const UV_ZONES: UVZone[] = [
  { max: 2,        label: 'Low',       color: '#22C55E', bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A' },
  { max: 5,        label: 'Moderate',  color: '#EAB308', bg: '#FEFCE8', border: '#FDE68A', text: '#CA8A04' },
  { max: 7,        label: 'High',      color: '#F97316', bg: '#FFF7ED', border: '#FED7AA', text: '#EA580C' },
  { max: 10,       label: 'Very High', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' },
  { max: Infinity, label: 'Extreme',   color: '#9333EA', bg: '#FAF5FF', border: '#E9D5FF', text: '#9333EA' },
];

// ─── UV zone lookup ────────────────────────────────────────────────────────────
export const getUVZone = (v: number): UVZone =>
  UV_ZONES.find(z => v <= z.max) ?? UV_ZONES[4];
