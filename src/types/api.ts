/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/types/api.ts
 * Layer: Frontend / TypeScript Types
 *
 * Purpose:
 * Defines the TypeScript types that mirror the SunSense backend's standard
 * JSON response envelope. Every response from the Express API is wrapped in
 * one of these shapes. Service files unwrap `.data.data` to get the payload.
 *
 * Backend Response Envelope (from utils/apiResponse.ts):
 *
 *   Success:
 *   { "success": true,  "data": <T> }
 *
 *   Error:
 *   { "success": false, "error": { "message": "...", "details"?: [...] } }
 *
 * Usage:
 *   const res = await apiClient.get<ApiResponse<DashboardPayload>>('/dashboard');
 *   const dashboard = res.data.data; // Type: DashboardPayload
 *
 * Do NOT add fields to these types that do not exist in the backend.
 * Do NOT duplicate these interfaces in individual service files.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Success Envelope ─────────────────────────────────────────────────────────

/**
 * Standard success response wrapper returned by the backend's sendSuccess() helper.
 *
 * @template T - The shape of the data payload for this specific endpoint.
 *
 * Example:
 *   ApiResponse<{ currentUv: number; peakUv: number }>
 *   → { success: true, data: { currentUv: 3.1, peakUv: 9.4 } }
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
}

// ─── Paginated Success Envelope ───────────────────────────────────────────────

/**
 * Pagination metadata returned alongside paginated lists.
 *
 * Matches the backend's pagination shape from:
 *   - history.service.ts
 *   - alerts.service.ts
 *
 * Used by History, Alerts (and future paginated endpoints).
 */
export interface PaginationMeta {
  /** Current page (1-indexed). */
  page: number;
  /** Max items returned per page. */
  limit: number;
  /** Total number of matching records in the database. */
  total: number;
  /** Total number of pages = ceil(total / limit). */
  totalPages: number;
  /** true if there is a page after this one. */
  hasNext: boolean;
  /** true if there is a page before this one. */
  hasPrevious: boolean;
}

/**
 * Paginated success response.
 *
 * Matches the shape returned by HistoryController.get() and AlertsController.get():
 *   { success: true, data: T[], pagination: PaginationMeta }
 *
 * @template T - The type of a single item in the list (e.g., ExposureSession).
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

// ─── Error Envelope ───────────────────────────────────────────────────────────

/**
 * Standard error response returned by the backend's sendError() helper.
 *
 * The `details` field is optional and only present when the backend
 * supplies extra context (e.g., Zod validation error arrays).
 *
 * Example:
 *   { success: false, error: { message: "Invalid credentials" } }
 *   { success: false, error: { message: "Validation failed", details: [...] } }
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    /** Human-readable description of what went wrong. */
    message: string;
    /**
     * Optional structured details.
     * Present on validation errors (Zod issues array from the backend).
     * Not present on simple error responses.
     */
    details?: unknown;
  };
}
