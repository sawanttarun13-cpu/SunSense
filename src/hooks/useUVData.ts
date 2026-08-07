/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: useUVData.ts
 * Layer: Frontend / Custom Hook
 *
 * Purpose:
 * Provides all UV data needed by the Dashboard and Analytics pages:
 * - Live current UV Index (ticks every 4 seconds)
 * - Today's peak UV and peak time
 * - Today's lowest UV and low time
 * - 24-hour hourly timeline for the UV chart
 *
 * Architecture — Global Singleton Store:
 * UV data is stored in `window.__uvStore` (not in React state) so that:
 * 1. It persists across React HMR reloads (the interval doesn't re-register).
 * 2. All components that call useUVData() share EXACTLY the same values —
 *    no divergence between the gauge in the header and the chart on the page.
 * 3. The 4-second ticker runs exactly once, not once per component mount.
 *
 * Mock Data Note (Phase 3):
 * All UV values are simulated using a deterministic seeded algorithm.
 * Past hourly values are frozen using a mathematical formula keyed to
 * the current date (daySeed) — they look realistic but are not real.
 * In Phase 6 (Frontend ↔ Backend Integration), this hook will be replaced
 * with real API calls to GET /api/v1/dashboard and GET /api/v1/readings.
 *
 * Ticker Behaviour:
 * Every 4 seconds:
 * 1. Current UV takes a random walk (±0.25 max drift, clamped 0.1–11.0).
 * 2. Peak UV only ever increases (ratchet up, never down).
 * 3. Low UV only ever decreases (ratchet down, never up).
 * 4. Only the current hour's slot in the 24-hour timeline is updated.
 *    All past hours are frozen (as they would be in the real database).
 *
 * @returns {object} UV data object:
 *   - uvValue    {number}     Current live UV Index
 *   - peakUV     {number}     Today's peak UV Index
 *   - lowUV      {number}     Today's lowest UV Index
 *   - peakTime   {string}     Time of today's peak ("H:MM AM/PM")
 *   - lowTime    {string}     Time of today's low  ("H:MM AM/PM")
 *   - hourlyData {UVReading[]} 24-slot hourly chart data
 *   - tick       {number}     Monotonically increasing counter (forces re-renders)
 *   - zone       {UVZone}     Risk zone for the current UV value
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect } from 'react';
import { getUVZone } from '../constants/uv';
import type { UVReading } from '../types/uv';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generates a deterministic UV Index value for a given hour and day seed.
 *
 * Algorithm:
 * - UV is 0 before 06:00 and after 19:00 (no sunlight).
 * - Within the active window, UV follows a sinusoidal arc peaking near noon.
 * - A pseudorandom noise factor (seeded by daySeed and hour) adds realism.
 *
 * The same seed + hour always produces the same value, which ensures
 * the 24-hour chart is consistent across page reloads on the same day.
 *
 * @param h    - Hour of the day (0–23).
 * @param seed - Day seed derived from today's date (YYYYMMDD as integer).
 * @returns    UV Index value rounded to 1 decimal, or 0 if outside active hours.
 */
function uvForHour(h: number, seed: number): number {
  if (h < 6 || h > 19) return 0;
  const t = (h - 6) / 13;
  const noise = 0.82 + (Math.sin(seed * 9301 + h * 49297) * 0.5 + 0.5) * 0.36;
  return parseFloat(Math.max(0, 9.8 * Math.sin(Math.PI * t) * noise).toFixed(1));
}

/**
 * Builds the initial 24-slot hourly UV timeline.
 *
 * - Past hours (h < currentHour): Filled with deterministic seeded values.
 * - Current hour (h === currentHour): Starts with the liveUV value.
 * - Future hours (h > currentHour): Set to 0 (no data yet).
 *
 * @param currentHour - Current hour of the day (0–23).
 * @param liveUV      - Starting UV value for the current hour.
 * @param seed        - Day seed for deterministic past hour generation.
 * @returns           Array of 24 UVReading objects (one per hour).
 */
function buildInitialTimeline(currentHour: number, liveUV: number, seed: number): UVReading[] {
  return Array.from({ length: 24 }, (_, h) => {
    let uv = 0;
    if (h < currentHour) {
      uv = uvForHour(h, seed);           // Past hour — deterministic, frozen forever
    } else if (h === currentHour) {
      uv = liveUV;                        // Current hour — starts with the live reading
    }
    // Future hours (h > currentHour) remain 0 — no data yet
    return { hour: `${String(h).padStart(2, '0')}:00`, uv, isCurrent: h === currentHour };
  });
}

/**
 * Formats a Date as "H:MM AM/PM" for display in the UI.
 *
 * @param d - Date to format.
 * @returns Formatted time string (e.g., "2:30 PM").
 */
function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ─── Global Live Store (HMR Safe) ─────────────────────────────────────────────
// Created ONCE per browser session; survives React HMR reloads.
if (!(window as any).__uvStore) {
  const now = new Date();
  const currentHour = now.getHours();
  // Day seed uniquely identifies today (YYYYMMDD as integer)
  const daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

  // Derive the current hour's UV value from the deterministic seed, falling back to 5.0
  const initialUV = parseFloat(Math.max(0.1, uvForHour(currentHour, daySeed) || 5.0).toFixed(1));

  // ─── Derive today's peak & low from the already-frozen past timeline ──────
  // We scan every past hour using the same deterministic seed so that peak/low
  // are always consistent with the timeline shown in the chart — exactly as the
  // backend would compute them by querying today's rows in PostgreSQL.
  let sessionPeak = initialUV;
  let sessionLow  = initialUV;
  let sessionPeakTime = fmtTime(now);
  let sessionLowTime  = fmtTime(now);

  for (let h = 6; h < currentHour; h++) {
    const hUV = uvForHour(h, daySeed);
    if (hUV > 0) {
      if (hUV > sessionPeak) {
        sessionPeak = hUV;
        const t = new Date(); t.setHours(h, 0, 0, 0);
        sessionPeakTime = fmtTime(t);
      }
      if (hUV < sessionLow) {
        sessionLow = hUV;
        const t = new Date(); t.setHours(h, 0, 0, 0);
        sessionLowTime = fmtTime(t);
      }
    }
  }

  const store = {
    uvValue:   initialUV,
    peakUV:    sessionPeak,
    lowUV:     sessionLow,
    peakTime:  sessionPeakTime,
    lowTime:   sessionLowTime,
    hourlyData: buildInitialTimeline(currentHour, initialUV, daySeed),
    tick: 0,
    daySeed,
    listeners: new Set<() => void>(),
  };

  // ─── Reset helper — to be called at midnight (later by the backend) ────────
  // Resets peak/low to the current value at the start of a new day.
  (store as any).resetDay = () => {
    const t = fmtTime(new Date());
    store.peakUV   = store.uvValue;
    store.lowUV    = store.uvValue;
    store.peakTime = t;
    store.lowTime  = t;
  };

  // ─── 4-second tick — simulates an incoming ESP8266 sensor reading ──────────
  // In Phase 6, this setInterval will be replaced with a real-time API poll
  // or WebSocket subscription to GET /api/v1/dashboard.
  setInterval(() => {
    const tickHour = new Date().getHours();

    // 1. Advance the live UV with a small random walk (clamped 0.1–11)
    store.uvValue = parseFloat(
      Math.min(11, Math.max(0.1, store.uvValue + (Math.random() - 0.48) * 0.5)).toFixed(1)
    );

    // 2. Update Peak — ONLY ever increases; never decreases within a day
    if (store.uvValue > store.peakUV) {
      store.peakUV   = store.uvValue;
      store.peakTime = fmtTime(new Date());
    }

    // 3. Update Low — ONLY ever decreases; never increases within a day
    if (store.uvValue < store.lowUV) {
      store.lowUV   = store.uvValue;
      store.lowTime = fmtTime(new Date());
    }

    // 4. Update ONLY the current hour's slot in the frozen timeline
    store.hourlyData = store.hourlyData.map((entry, h) => {
      if (h === tickHour) {
        return { ...entry, uv: store.uvValue, isCurrent: true };
      }
      if (entry.isCurrent && h !== tickHour) {
        // Hour rolled over — freeze the value, clear the live flag
        return { ...entry, isCurrent: false };
      }
      return entry; // All past/future hours — completely untouched
    });

    store.tick++;
    store.listeners.forEach(l => l()); // Notify all subscribed components
  }, 4000);

  (window as any).__uvStore = store;
}

// ─── Live UV data hook ─────────────────────────────────────────────────────────

/**
 * useUVData
 *
 * Subscribes to the global UV store and returns the latest snapshot.
 * Components that call this hook will re-render every 4 seconds when
 * the tick fires, receiving the updated UV values.
 *
 * The subscription is cleaned up when the component unmounts.
 *
 * @returns Current UV metrics including zone, peak, low, and hourly chart data.
 */
export function useUVData() {
  const store = (window as any).__uvStore;

  const [state, setState] = useState({
    uvValue:   store.uvValue   as number,
    peakUV:    store.peakUV    as number,
    lowUV:     store.lowUV     as number,
    peakTime:  store.peakTime  as string,
    lowTime:   store.lowTime   as string,
    hourlyData: store.hourlyData as UVReading[],
    tick: store.tick as number,
  });

  useEffect(() => {
    const listener = () => setState({
      uvValue:   store.uvValue,
      peakUV:    store.peakUV,
      lowUV:     store.lowUV,
      peakTime:  store.peakTime,
      lowTime:   store.lowTime,
      hourlyData: store.hourlyData,
      tick:      store.tick,
    });

    store.listeners.add(listener);
    listener(); // Sync immediately in case the store ticked before this effect ran

    return () => { store.listeners.delete(listener); }; // Cleanup on unmount
  }, [store]);

  const zone = getUVZone(state.uvValue);

  return {
    uvValue:    state.uvValue,
    peakUV:     state.peakUV,
    lowUV:      state.lowUV,
    peakTime:   state.peakTime,
    lowTime:    state.lowTime,
    hourlyData: state.hourlyData,
    tick:       state.tick,
    zone,
  };
}
