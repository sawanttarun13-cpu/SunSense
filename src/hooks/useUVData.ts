import { useState, useEffect } from 'react';
import { getUVZone } from '../constants/uv';
import type { UVReading } from '../types/uv';

// ─── Hourly data generator ────────────────────────────────────────────────────
export function generateHourly(): UVReading[] {
  const hour = new Date().getHours();
  return Array.from({ length: 24 }, (_, h) => {
    let uv = 0;
    if (h >= 6 && h <= 19) {
      const t = (h - 6) / 13;
      uv = Math.max(0, 9.8 * Math.sin(Math.PI * t) * (0.82 + Math.random() * 0.36));
      uv = parseFloat(uv.toFixed(1));
    }
    return { hour: `${String(h).padStart(2, '0')}:00`, uv, isCurrent: h === hour };
  });
}

// ─── Global Live Store (HMR Safe) ─────────────────────────────────────────────
if (!(window as any).__uvStore) {
  const store = {
    uvValue: 7.2,
    hourlyData: generateHourly(),
    tick: 0,
    listeners: new Set<() => void>()
  };

  setInterval(() => {
    store.uvValue = Math.min(11, Math.max(0.1, +(store.uvValue + (Math.random() - 0.48) * 0.5).toFixed(1)));
    store.hourlyData = generateHourly();
    store.tick++;
    store.listeners.forEach(l => l());
  }, 4000);

  (window as any).__uvStore = store;
}

// ─── Live UV data hook ────────────────────────────────────────────────────────
export function useUVData() {
  const store = (window as any).__uvStore;

  const [state, setState] = useState({
    uvValue: store.uvValue,
    hourlyData: store.hourlyData,
    tick: store.tick
  });

  useEffect(() => {
    const listener = () => setState({
      uvValue: store.uvValue,
      hourlyData: store.hourlyData,
      tick: store.tick
    });
    
    store.listeners.add(listener);
    // Sync immediately in case store updated before effect ran
    listener();
    
    return () => { store.listeners.delete(listener); };
  }, [store]);

  const zone = getUVZone(state.uvValue);

  return { uvValue: state.uvValue, hourlyData: state.hourlyData, tick: state.tick, zone };
}
