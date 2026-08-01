import { useState, useEffect } from 'react';
import { getUVZone } from '../constants/uv';
import type { UVReading } from '../types/uv';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uvForHour(h: number, seed: number): number {
  if (h < 6 || h > 19) return 0;
  const t = (h - 6) / 13;
  const noise = 0.82 + (Math.sin(seed * 9301 + h * 49297) * 0.5 + 0.5) * 0.36;
  return parseFloat(Math.max(0, 9.8 * Math.sin(Math.PI * t) * noise).toFixed(1));
}

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

/** Format a Date as "H:MM AM/PM" for display in the UI. */
function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ─── Global Live Store (HMR Safe) ─────────────────────────────────────────────
// Created ONCE per browser session; survives React HMR reloads.
if (!(window as any).__uvStore) {
  const now = new Date();
  const currentHour = now.getHours();
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
  (store as any).resetDay = () => {
    const t = fmtTime(new Date());
    store.peakUV   = store.uvValue;
    store.lowUV    = store.uvValue;
    store.peakTime = t;
    store.lowTime  = t;
  };

  // ─── 4-second tick — simulates an incoming ESP8266 sensor reading ──────────
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
    store.listeners.forEach(l => l());
  }, 4000);

  (window as any).__uvStore = store;
}

// ─── Live UV data hook ─────────────────────────────────────────────────────────
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

    return () => { store.listeners.delete(listener); };
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
