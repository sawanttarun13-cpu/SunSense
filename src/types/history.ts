/**
 * ---------------------------------------------------------
 * File: history.ts
 * Purpose:
 * TypeScript type definitions for history.
 * ---------------------------------------------------------
 */

export interface UVLogEntry {
  id: string | number;
  deviceId: string;
  recordedAt: string;
  uvIndex: number;
  minimumUvIndex?: number;
  maximumUvIndex?: number;
  sampleCount?: number;
}
