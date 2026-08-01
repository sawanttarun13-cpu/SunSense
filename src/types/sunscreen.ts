export type SunscreenStatus = 'unprotected' | 'protected' | 'expired';

export interface SunscreenState {
  status: SunscreenStatus;
  appliedSPF: number | null;
  appliedAt: Date | null;
  expiresAt: Date | null;
  remainingMs: number;
}
