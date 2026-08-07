/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: uv.ts (types)
 * Layer: Frontend / TypeScript Types
 *
 * Purpose:
 * Defines TypeScript interfaces for UV-related data used across
 * the frontend. Used by the useUVData hook, UV chart components,
 * the dashboard page, and the UV constants module.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Represents a WHO UV Index risk zone with its associated display properties.
 *
 * Used by the UV gauge, header badge, and risk alert components to
 * visually communicate the current UV risk level to the user.
 *
 * Properties:
 * - max    → Upper UV boundary of this zone (exclusive)
 * - label  → Human-readable zone name ("Low", "Moderate", etc.)
 * - color  → Primary zone colour (hex) — used for chart fills and gauge
 * - bg     → Light background tint (hex) — used for card backgrounds
 * - border → Border colour (hex) — used for card borders
 * - text   → Text colour (hex) — used for labels on coloured backgrounds
 */
export interface UVZone {
  max: number;
  label: string;
  color: string;
  bg: string;
  border: string;
  text: string;
}

/**
 * Represents a single hourly UV reading in the 24-hour timeline chart.
 *
 * Used by the UVChart component to render the hourly bar/line chart on
 * the Dashboard. Past hours have fixed values; the current hour updates
 * every 4 seconds; future hours have uv=0.
 *
 * Properties:
 * - hour      → Display string in "HH:00" format (e.g., "14:00")
 * - uv        → UV Index value for that hour (0 for future hours)
 * - isCurrent → True only for the current hour — used to highlight the active bar
 */
export interface UVReading {
  hour: string;
  uv: number;
  isCurrent?: boolean;
}
