/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/types/auth.ts
 * Layer: Frontend / TypeScript Types
 *
 * Purpose:
 * Defines authentication and user profile related types.
 * Matches the backend schema for User objects returned by the API.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface User {
  id: string;
  email: string;
  name: string;
  skinType?: number;
  preferredSpf?: number;
}
