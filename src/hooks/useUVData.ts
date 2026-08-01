import { useState, useEffect } from 'react';
import { getUVZone } from '../constants/uv';
import type { UVReading } from '../types/uv';

// ─── Stable UV value for a given hour ─────────────────────────────────────────
// Uses a deterministic sine curve with per-hour seeded noise so that historical
// readings never change — exactly how real PostgreSQL-stored data would behave.
function uvForHour(h: number, seed: number): number {
  if (h < 6 || h > 19) return 0;
  const t = (h - 6) / 13;
  // Seeded pseudo-random: same hour always gives the same "noise" offset
  const noise = 0.82 + (Math.sin(seed * 9301 + h * 49297) * 0.5 + 0.5) * 0.36;
  return parseFloat(Math.max(0, 9.8 * Math.sin(Math.PI * t) * noise).toFixed(1));
}

// ─── Build the initial frozen timeline ────────────────────────────────────────
// Called ONCE when the store is first created.
// Past hours get a stable deterministic value.
// Current hour gets the live value.
// Future hours remain 0 (no data yet).
function buildInitialTimeline(currentHour: number, liveUV: number, seed: number): UVReading[] {
  return Array.from({ length: 24 }, (_, h) => {
    let uv = 0;
    if (h < currentHour) {
      // Past hour — deterministic, will never change
      uv = uvForHour(h, seed);
    } else if (h === currentHour) {
      // Current hour — starts with the live reading
      uv = liveUV;
    }
    // Future hours (h > currentHour) remain 0
    return {
      hour: `${String(h).padStart(2, '0')}:00`,
      uv,
      isCurrent: h === currentHour,
    };
  });
}

// ─── Global Live Store (HMR Safe) ─────────────────────────────────────────────
// The store is created once per browser session and survives React HMR reloads.
if (!(window as any).__uvStore) {
  const now = new Date();
  const currentHour = now.getHours();

  // A seed derived from today's date so the graph shape is consistent per day
  // but different across days — exactly like real logged data.
  const daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

  const initialUV = parseFloat(
    Math.max(0.1, uvForHour(currentHour, daySeed) || 5.0).toFixed(1)
  );

  const store = {
    uvValue: initialUV,
    // Timeline is built ONCE — historical entries are frozen from this point on
    hourlyData: buildInitialTimeline(currentHour, initialUV, daySeed),
    tick: 0,
    daySeed,
    listeners: new Set<() => void>(),
  };

  // ─── 4-second tick — simulates an incoming ESP8266 sensor reading ──────────
  // Only the CURRENT hour's data point is updated.
  // No past values are ever touched.
  setInterval(() => {
    const tickHour = new Date().getHours();

    // Simulate natural UV drift: small random walk clamped to 0.1–11
    store.uvValue = parseFloat(
      Math.min(11, Math.max(0.1, store.uvValue + (Math.random() - 0.48) * 0.5)).toFixed(1)
    );

    // Update ONLY the current hour's slot in the frozen timeline
    store.hourlyData = store.hourlyData.map((entry, h) => {
      if (h === tickHour) {
        // Current hour — replace with the latest live reading
        return { ...entry, uv: store.uvValue, isCurrent: true };
      }
      if (entry.isCurrent && h !== tickHour) {
        // Hour has just rolled over — clear the isCurrent flag, value stays
        return { ...entry, isCurrent: false };
      }
      // All other hours — completely untouched
      return entry;
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
    uvValue: store.uvValue,
    hourlyData: store.hourlyData,
    tick: store.tick,
  });

  useEffect(() => {
    const listener = () =>
      setState({
        uvValue: store.uvValue,
        hourlyData: store.hourlyData,
        tick: store.tick,
      });

    store.listeners.add(listener);
    // Sync immediately in case the store updated before this effect ran
    listener();

    return () => { store.listeners.delete(listener); };
  }, [store]);

  const zone = getUVZone(state.uvValue);

  return { uvValue: state.uvValue, hourlyData: state.hourlyData, tick: state.tick, zone };
}
