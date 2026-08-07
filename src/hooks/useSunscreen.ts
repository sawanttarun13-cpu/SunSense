/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: useSunscreen.ts
 * Layer: Frontend / Custom Hook
 *
 * Purpose:
 * Manages the sunscreen protection state for the Dashboard's sunscreen
 * tracker component. Tracks application time, SPF, expiry, and the
 * live countdown of remaining protection minutes.
 *
 * Architecture — Global Singleton Store:
 * Like useUVData, the sunscreen state is stored in `window.__sunscreenStore`
 * so that:
 * 1. It persists across React HMR reloads.
 * 2. All components sharing this hook see the same state (e.g., the
 *    dashboard tile and the sunscreen modal stay in sync).
 * 3. The 1-second countdown ticker runs exactly once.
 *
 * Mock Data Note (Phase 3):
 * Currently, sunscreen state is managed entirely in-memory (no API calls).
 * In Phase 6 (Frontend ↔ Backend Integration), `applySunscreen` will call
 * POST /api/v1/sunscreen and initial state will be loaded from
 * GET /api/v1/dashboard's activeProtection/protectionRemaining fields.
 *
 * Ticker Behaviour:
 * Every second:
 * - If status is 'protected', recalculates remaining milliseconds.
 * - If remainingMs drops to 0 or below, transitions status to 'expired'.
 * - Notifies all subscribed components (React re-renders the countdown).
 *
 * @returns {object} Sunscreen state and actions:
 *   - status         {'unprotected'|'protected'|'expired'} Current protection state
 *   - appliedSPF     {number|null}  SPF of the currently active application
 *   - appliedAt      {Date|null}    When the sunscreen was applied
 *   - expiresAt      {Date|null}    When the protection expires
 *   - remainingMs    {number}       Milliseconds of protection remaining (≥ 0)
 *   - applySunscreen {Function}     Call to log a new sunscreen application
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect } from 'react';
import type { SunscreenState } from '../types/sunscreen';

// ─── Global Mock Store for Sunscreen (HMR Safe) ──────────────────────────────
// The store is created once per browser session. Survives React HMR reloads.
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

  // ─── 1-second countdown ticker ────────────────────────────────────────────
  // Only runs while the user has active protection.
  // In Phase 6, this will be replaced with the protectionRemaining value
  // returned by GET /api/v1/dashboard (updated every 30 seconds).
  setInterval(() => {
    if (store.state.status === 'protected' && store.state.expiresAt) {
      const now = new Date();
      const remainingMs = store.state.expiresAt.getTime() - now.getTime();

      if (remainingMs <= 0) {
        // Protection has expired — transition to 'expired' state
        store.state.status = 'expired';
        store.state.remainingMs = 0;
      } else {
        store.state.remainingMs = remainingMs;
      }

      store.listeners.forEach(l => l()); // Notify subscribed components
    }
  }, 1000);

  // ─── Apply Sunscreen Action ──────────────────────────────────────────────────
  // Called when the user taps "I Applied Sunscreen" in the UI.
  // Sets protection for 2 hours (120 minutes) from the given time.
  // In Phase 6, this will call POST /api/v1/sunscreen before updating state.
  (store as any).applySunscreen = (spf: number, time: Date) => {
    const expiresAt = new Date(time.getTime() + 2 * 60 * 60 * 1000); // +2 hours
    const now = new Date();
    const remainingMs = Math.max(0, expiresAt.getTime() - now.getTime());

    store.state = {
      status: remainingMs > 0 ? 'protected' : 'expired',
      appliedSPF: spf,
      appliedAt: time,
      expiresAt,
      remainingMs,
    };
    
    store.listeners.forEach(l => l()); // Immediately notify all subscribed components
  };

  (window as any).__sunscreenStore = store;
}

// ─── Live Sunscreen Hook ─────────────────────────────────────────────────────

/**
 * useSunscreen
 *
 * Subscribes to the global sunscreen store and returns the latest state.
 * Components that call this hook re-render each second while protection
 * is active (driven by the 1-second ticker in the store).
 *
 * @returns Current sunscreen state + applySunscreen action function.
 */
export function useSunscreen() {
  const store = (window as any).__sunscreenStore;

  const [state, setState] = useState<SunscreenState>(store.state);

  useEffect(() => {
    const listener = () => setState({ ...store.state });
    store.listeners.add(listener);
    listener(); // Sync immediately on mount

    return () => { store.listeners.delete(listener); }; // Cleanup on unmount
  }, [store]);

  /**
   * Records a sunscreen application with the given SPF and application time.
   *
   * @param spf  - SPF factor of the applied sunscreen (e.g., 30, 50).
   * @param time - Timestamp when the sunscreen was applied (usually `new Date()`).
   */
  const applySunscreen = (spf: number, time: Date) => {
    store.applySunscreen(spf, time);
  };

  return {
    ...state,
    applySunscreen,
  };
}
