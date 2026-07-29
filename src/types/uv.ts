// ─── UV Zone type ─────────────────────────────────────────────────────────────
export interface UVZone {
  max: number;
  label: string;
  color: string;
  bg: string;
  border: string;
  text: string;
}

// ─── UV Reading type (hourly chart data) ──────────────────────────────────────
export interface UVReading {
  hour: string;
  uv: number;
  isCurrent?: boolean;
}
