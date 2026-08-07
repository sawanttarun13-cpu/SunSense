/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: uv.ts (constants)
 * Layer: Frontend / Constants
 *
 * Purpose:
 * Defines the WHO UV Index risk zones with their visual display properties
 * and provides the `getUVZone` lookup function used across the frontend.
 *
 * This is the single source of truth for UV risk colours and labels.
 * All components (gauge, chart bars, header badge, risk cards) read
 * zone styles from here rather than duplicating colour values.
 *
 * WHO UV Index Risk Scale Reference:
 * https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { UVZone } from '../types/uv';

/**
 * Ordered array of UV risk zones from lowest to highest.
 *
 * Each zone contains:
 * - max    → Upper UV boundary (e.g., max=2 means UV 0.0–2.0 is LOW)
 * - label  → Display name shown in the UI
 * - color  → Primary accent colour (used for chart fills, gauge arc)
 * - bg     → Light background tint (used for card/badge backgrounds)
 * - border → Border colour for zone-styled cards
 * - text   → Text colour for labels displayed on the bg background
 *
 * WHO Thresholds:
 * LOW        UVI  0 – 2
 * MODERATE   UVI  3 – 5
 * HIGH       UVI  6 – 7
 * VERY HIGH  UVI  8 – 10
 * EXTREME    UVI 11+
 */
export const UV_ZONES: UVZone[] = [
  { max: 2,        label: 'Low',       color: '#22C55E', bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A' },
  { max: 5,        label: 'Moderate',  color: '#EAB308', bg: '#FEFCE8', border: '#FDE68A', text: '#CA8A04' },
  { max: 7,        label: 'High',      color: '#F97316', bg: '#FFF7ED', border: '#FED7AA', text: '#EA580C' },
  { max: 10,       label: 'Very High', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' },
  { max: Infinity, label: 'Extreme',   color: '#9333EA', bg: '#FAF5FF', border: '#E9D5FF', text: '#9333EA' },
];

/**
 * Returns the UV risk zone for a given UV Index value.
 *
 * Performs a linear scan through UV_ZONES in ascending order.
 * Returns the first zone whose `max` is >= v.
 * Falls back to the EXTREME zone (index 4) if no match is found
 * (which should never happen given the Infinity upper bound).
 *
 * @param v - The UV Index value to classify (0–20+).
 * @returns  The matching UVZone object with all display properties.
 *
 * @example
 * getUVZone(0);    // → { label: 'Low', ... }
 * getUVZone(6.5);  // → { label: 'High', ... }
 * getUVZone(11);   // → { label: 'Extreme', ... }
 */
export const getUVZone = (v: number): UVZone =>
  UV_ZONES.find(z => v <= z.max) ?? UV_ZONES[4];
