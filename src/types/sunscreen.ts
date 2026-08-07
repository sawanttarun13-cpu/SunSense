/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: sunscreen.ts (types)
 * Layer: Frontend / TypeScript Types
 *
 * Purpose:
 * Defines TypeScript types for the sunscreen protection tracker
 * used by the useSunscreen hook and the SunscreenTracker component.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Possible sunscreen protection statuses.
 *
 * - 'unprotected' → User has never applied sunscreen or it was cleared
 * - 'protected'   → Sunscreen is active and expiresAt is in the future
 * - 'expired'     → expiresAt has passed — user should reapply
 */
export type SunscreenStatus = 'unprotected' | 'protected' | 'expired';

/**
 * The complete state of the sunscreen protection tracker.
 *
 * Used by the useSunscreen hook return value and the SunscreenTracker
 * component to render the protection countdown and status badge.
 *
 * Properties:
 * - status      → Current protection state ('unprotected'|'protected'|'expired')
 * - appliedSPF  → SPF factor of the applied sunscreen (null if unprotected)
 * - appliedAt   → When the sunscreen was applied (null if unprotected)
 * - expiresAt   → When the protection expires (null if unprotected)
 * - remainingMs → Milliseconds of protection remaining (0 if expired/unprotected)
 */
export interface SunscreenState {
  status: SunscreenStatus;
  appliedSPF: number | null;
  appliedAt: Date | null;
  expiresAt: Date | null;
  remainingMs: number;
}
