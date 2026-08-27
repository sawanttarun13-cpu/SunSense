/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/lib/apiClient.ts
 * Layer: Frontend / HTTP Infrastructure
 *
 * Purpose:
 * Provides the ONE shared Axios instance for the entire SunSense frontend.
 * All service files (dashboard.service.ts, profile.service.ts, etc.) MUST
 * import and use this client. No service may create its own Axios instance.
 *
 * Architecture:
 *   React Page / Hook
 *     ↓
 *   *Service (alerts.service.ts, etc.)
 *     ↓
 *   apiClient  ← THIS FILE
 *     ↓
 *   Express API  (http://localhost:5000/api/v1)
 *     ↓
 *   Prisma → PostgreSQL
 *
 * Token Architecture:
 * - Access token (JWT, 15 min): stored in memory via getAccessToken() /
 *   setAccessToken() below. NOT in localStorage (XSS risk).
 * - Refresh token (JWT, 7 days): stored as an HttpOnly cookie by the backend.
 *   JavaScript cannot read it. The browser sends it automatically when
 *   withCredentials: true and the cookie's domain matches.
 *
 * Request Interceptor:
 * - Reads the in-memory access token and attaches it as:
 *     Authorization: Bearer <token>
 * - Requests with no token (e.g. /auth/login) are sent without the header.
 *
 * Response Interceptor (401 handling):
 * - On HTTP 401, attempts POST /auth/refresh ONCE.
 * - Browser automatically sends the HttpOnly refreshToken cookie.
 * - On success: stores the new access token, retries the original request.
 * - On failure (expired / missing cookie): clears the access token so the
 *   app's AuthContext can redirect to /login.
 * - A retry flag prevents infinite refresh loops.
 *
 * Phase Notes:
 * Phase 6B — This file is created. No page integrations yet.
 * Phase 6C — AuthContext will call setAccessToken() on login and clearAccessToken() on logout.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, ApiErrorResponse } from '../types/api';

// ─── Environment ──────────────────────────────────────────────────────────────

/**
 * Base URL read from the Vite environment at build time.
 * Set VITE_API_URL in your .env file. Never hardcode production URLs here.
 *
 * Example: VITE_API_URL=http://localhost:5000/api/v1
 */
const BASE_URL: string = import.meta.env.VITE_API_URL as string;

if (!BASE_URL) {
  // Loud warning in development if the env var is missing, to prevent silent failures.
  console.warn(
    '[apiClient] VITE_API_URL is not set. ' +
    'Copy .env.example → .env and set VITE_API_URL=http://localhost:5000/api/v1'
  );
}

// ─── In-Memory Token Store ────────────────────────────────────────────────────
//
// The access token lives ONLY in module-level memory.
// It is NEVER written to localStorage, sessionStorage, or any cookie.
//
// Why in-memory?
//   - localStorage is readable by any JS on the page → XSS attack vector.
//   - The refresh token is already safely stored as an HttpOnly cookie by the backend.
//   - If the user refreshes the page, the app will silently obtain a new access token
//     via POST /auth/refresh (the HttpOnly cookie is sent automatically by the browser).
//
// These functions are called only by:
//   - AuthContext (Phase 6C): setAccessToken on login, clearAccessToken on logout.
//   - The response interceptor below: setAccessToken after a successful token refresh.

let _accessToken: string | null = null;

/**
 * Returns the current in-memory access token, or null if not authenticated.
 * Called by the request interceptor on every outbound request.
 */
export function getAccessToken(): string | null {
  return _accessToken;
}

/**
 * Stores a new access token in memory.
 * Called by AuthContext after a successful login or token refresh.
 *
 * @param token - The JWT access token received from POST /auth/login or /auth/refresh.
 */
export function setAccessToken(token: string): void {
  _accessToken = token;
}

/**
 * Clears the in-memory access token.
 * Called by AuthContext on logout or when a token refresh fails.
 */
export function clearAccessToken(): void {
  _accessToken = null;
}

// ─── Axios Instance ───────────────────────────────────────────────────────────

/**
 * The shared Axios instance for the entire SunSense frontend.
 *
 * Configuration:
 * - baseURL:         Reads from VITE_API_URL (set in .env).
 * - withCredentials: true — Required so the browser automatically includes the
 *                   HttpOnly refreshToken cookie on every request, enabling
 *                   silent token refresh without JS ever touching the cookie.
 * - timeout:         10 000 ms (10 seconds). After this, a normalized timeout
 *                   error is thrown rather than hanging indefinitely.
 * - headers:         Content-Type is defaulted to application/json, matching
 *                   the Express backend's expected format.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
//
// Runs before every outbound request.
// Reads the in-memory access token and attaches it as an Authorization header.
// Requests with no token (login, register, refresh) are sent as-is.

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Request setup errors (rare — e.g., invalid config) are passed through.
    return Promise.reject(error);
  }
);

// ─── Response Interceptor (401 / Token Refresh) ───────────────────────────────
//
// Handles the silent token-refresh cycle when the access token expires.
//
// Flow:
//   1. Any response with HTTP 401 triggers this interceptor.
//   2. If a refresh has NOT already been attempted for this request (_retry flag),
//      attempt POST /auth/refresh. The browser sends the HttpOnly cookie automatically.
//   3. On success: store the new access token, retry the original request once.
//   4. On failure (e.g., refresh token expired, no cookie): clear the access token.
//      The app's AuthContext watches for clearAccessToken() and redirects to /login.
//   5. _retry prevents this handler from recursively retrying refresh failures.
//
// Security notes:
//   - We never touch the refresh token in JavaScript — it lives in the cookie only.
//   - We never retry more than once — no infinite refresh loop is possible.

apiClient.interceptors.response.use(
  // Pass all 2xx responses through unchanged.
  (response: AxiosResponse) => response,

  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh on 401 Unauthorized, and only once per request.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Guard against infinite loops

      try {
        // POST /auth/refresh — browser sends HttpOnly refreshToken cookie automatically.
        // Do NOT use apiClient here; that would trigger this interceptor recursively.
        // Use a plain axios call to the refresh endpoint directly.
        const refreshResponse = await axios.post<ApiResponse<{ token: string }>>(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshResponse.data.data.token;
        setAccessToken(newToken);

        // Attach the new token to the retried request.
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        // Retry the original request once with the new access token.
        return apiClient(originalRequest);

      } catch (_refreshError) {
        // Refresh failed — session has truly expired.
        // Clear the in-memory token. AuthContext (Phase 6C) will react to this
        // and redirect the user to /login.
        clearAccessToken();

        // Re-throw so the original caller receives a proper error.
        return Promise.reject(normalizeError(_refreshError));
      }
    }

    // For all other errors (400, 403, 404, 500, network timeout, etc.),
    // normalize and forward to the caller.
    return Promise.reject(normalizeError(error));
  }
);

// ─── Error Normalization ──────────────────────────────────────────────────────
//
// Converts any Axios error into a consistent AppError shape.
// This lets page components and service files handle errors without
// importing Axios types or writing `if (axios.isAxiosError(err))` everywhere.

/**
 * A normalized application error with structured fields.
 *
 * Properties mirror what the backend's sendError() utility returns:
 *   { success: false, error: { message: string, details?: any } }
 *
 * Additional frontend-level fields:
 *   - status:      HTTP status code, or 0 for network/timeout errors.
 *   - isNetwork:   true when the request never reached the server.
 *   - isAuth:      true for 401 Unauthorized (session expired / not logged in).
 *   - isForbidden: true for 403 Forbidden.
 *   - validation:  Zod validation error details, if the backend provided them.
 */
export interface AppError {
  /** Human-readable error message (from backend or a fallback). */
  message: string;
  /** HTTP status code. 0 means the request never reached the server. */
  status: number;
  /** true if the request never reached the server (network down / timeout). */
  isNetwork: boolean;
  /** true for HTTP 401 — session expired or not logged in. */
  isAuth: boolean;
  /** true for HTTP 403 — authenticated but not permitted. */
  isForbidden: boolean;
  /** Zod validation error array from the backend, if present. */
  validation?: unknown;
}

/**
 * Converts any Axios error (or unknown thrown value) into an AppError.
 *
 * Usage in service files:
 *   try {
 *     const res = await apiClient.get('/dashboard');
 *     return res.data.data;
 *   } catch (err) {
 *     throw normalizeError(err);
 *   }
 *
 * @param error - Any thrown value (Axios error, plain Error, unknown).
 * @returns     A structured AppError.
 */
export function normalizeError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const responseData = error.response?.data as ApiErrorResponse | undefined;

    // Network error or timeout — request never reached the server.
    if (!error.response) {
      return {
        message: error.code === 'ECONNABORTED'
          ? 'Request timed out — please check your connection and try again.'
          : 'Network error — unable to reach the server. Check your connection.',
        status: 0,
        isNetwork: true,
        isAuth: false,
        isForbidden: false,
      };
    }

    return {
      message: responseData?.error?.message ?? error.message ?? 'An unexpected error occurred.',
      status,
      isNetwork: false,
      isAuth: status === 401,
      isForbidden: status === 403,
      validation: responseData?.error?.details,
    };
  }

  // Fallback for non-Axios errors (e.g., programming errors thrown synchronously).
  const msg = error instanceof Error ? error.message : 'An unexpected error occurred.';
  return {
    message: msg,
    status: 0,
    isNetwork: false,
    isAuth: false,
    isForbidden: false,
  };
}

export default apiClient;
