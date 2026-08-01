import { useState, useEffect } from 'react';
import type { SunscreenState } from '../types/sunscreen';

// ─── Global Mock Store for Sunscreen (HMR Safe) ──────────────────────────────
// The store is created once per browser session.
if (!(window as any).__sunscreenStore) {
  const store = {
    state: {
      status: 'unprotected',
      appliedSPF: null,
      appliedAt: null,
      expiresAt: null,
      remainingMs: 0,
    } as SunscreenState,
    listeners: new Set<() => void>(),
  };

  // ─── 1-second tick to update timer ───────────────────────────────────────────
  setInterval(() => {
    if (store.state.status === 'protected' && store.state.expiresAt) {
      const now = new Date();
      const remainingMs = store.state.expiresAt.getTime() - now.getTime();

      if (remainingMs <= 0) {
        store.state.status = 'expired';
        store.state.remainingMs = 0;
      } else {
        store.state.remainingMs = remainingMs;
      }

      store.listeners.forEach(l => l());
    }
  }, 1000);

  // ─── Apply Sunscreen Action ──────────────────────────────────────────────────
  (store as any).applySunscreen = (spf: number, time: Date) => {
    const expiresAt = new Date(time.getTime() + 2 * 60 * 60 * 1000); // 2 hours
    const now = new Date();
    const remainingMs = Math.max(0, expiresAt.getTime() - now.getTime());

    store.state = {
      status: remainingMs > 0 ? 'protected' : 'expired',
      appliedSPF: spf,
      appliedAt: time,
      expiresAt,
      remainingMs,
    };
    
    store.listeners.forEach(l => l());
  };

  (window as any).__sunscreenStore = store;
}

// ─── Live Hook ─────────────────────────────────────────────────────────────────
export function useSunscreen() {
  const store = (window as any).__sunscreenStore;

  const [state, setState] = useState<SunscreenState>(store.state);

  useEffect(() => {
    const listener = () => setState({ ...store.state });
    store.listeners.add(listener);
    listener(); // Sync immediately

    return () => { store.listeners.delete(listener); };
  }, [store]);

  const applySunscreen = (spf: number, time: Date) => {
    store.applySunscreen(spf, time);
  };

  return {
    ...state,
    applySunscreen,
  };
}
