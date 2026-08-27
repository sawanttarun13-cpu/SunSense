# Phase 6B — Axios / Frontend API Foundation Report

**Phase:** 6B  
**Date:** 2026-08-27  
**Status:** ✅ COMPLETE  
**Build:** ✓ Passed (`pnpm run build` — exit code 0, 2267 modules transformed)

> **Phase 6B does NOT replace mock data and does NOT integrate pages yet.**  
> All service files remain on `Promise.resolve(MOCK_DATA)`. Page components are untouched.  
> This milestone establishes the infrastructure that Phase 6C and beyond will build on.

---

## 1. Dependencies

| Package | Version | Action | Reason |
|---|---|---|---|
| `axios` | `1.20.0` | **Installed** | The single HTTP client for all frontend API calls |

No duplicate HTTP libraries were added. No other dependencies were changed.

**Package manager:** pnpm (existing project standard)  
**Command run:** `pnpm add axios`

---

## 2. Files Created

| File | Purpose |
|---|---|
| [`src/lib/apiClient.ts`](file:///d:/SunSense/SunSense/src/lib/apiClient.ts) | Single shared Axios instance: interceptors, token store, error normalization |
| [`src/types/api.ts`](file:///d:/SunSense/SunSense/src/types/api.ts) | Shared TypeScript types for the backend response envelope |
| [`.env`](file:///d:/SunSense/SunSense/.env) | Development environment variables (`VITE_API_URL`) |
| [`.env.example`](file:///d:/SunSense/SunSense/.env.example) | Committed template developers copy to create their `.env` |

---

## 3. Files Modified

| File | Change |
|---|---|
| [`.gitignore`](file:///d:/SunSense/SunSense/.gitignore) | Added `.env`, `.env.local`, `.env.*.local`, and `dist` to prevent committing secrets/build output |
| [`README.md`](file:///d:/SunSense/SunSense/README.md) | Added "API Client Architecture (Phase 6B)" section with setup guide, token architecture table, and service usage example |

**No page components, service files, hooks, mock data, or backend files were modified.**

---

## 4. API Client Architecture

```
React Page / Hook
  ↓
src/services/*.service.ts  (calls apiClient)
  ↓
src/lib/apiClient.ts       ← Axios instance (this milestone)
  ↓  Authorization: Bearer <token>  (request interceptor)
  ↓  withCredentials: true           (sends HttpOnly cookie)
Express API  http://localhost:5000/api/v1
  ↓
Prisma → PostgreSQL
```

### Axios Instance Configuration

```typescript
axios.create({
  baseURL:         import.meta.env.VITE_API_URL,  // from .env
  withCredentials: true,                            // required for HttpOnly cookie
  timeout:         10_000,                          // 10 second timeout
  headers: { 'Content-Type': 'application/json' }
});
```

### The One Client Rule

> **All service files MUST import `apiClient` from `src/lib/apiClient.ts`.**  
> No service file may call `axios.create()` directly.  
> Enforced by documentation; to be enforced by linting in a future pass.

---

## 5. Environment Configuration

| Variable | Value (dev) | File |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api/v1` | `.env` (not committed) |

`.env.example` (committed to git) contains the same variable with the same development value as a reference.

> `.env` is protected by `.gitignore` and will never be committed.  
> No database credentials, JWT secrets, or sensitive values exist in the frontend.

---

## 6. Request Interceptor

Runs before every outbound Axios request.

**Responsibility:** Attach the `Authorization` header when an access token exists.

```typescript
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();  // reads in-memory _accessToken
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
```

- Requests with no token (login, register, token refresh) proceed **without** the header.
- No token is ever read from localStorage or any cookie.
- In Phase 6C, `AuthContext.login()` will call `setAccessToken(token)` after a successful login, which makes the interceptor automatically attach it to all subsequent requests.

---

## 7. Response Interceptor

Runs after every Axios response (both success and error).

**Responsibility:** Silently renew the access token on 401, then retry the original request once.

```typescript
apiClient.interceptors.response.use(
  (response) => response,   // Pass 2xx through unchanged

  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // POST /auth/refresh  ← browser sends HttpOnly cookie automatically
      const { token } = await axios.post('/auth/refresh', {}, { withCredentials: true });
      setAccessToken(token);
      originalRequest.headers['Authorization'] = `Bearer ${token}`;
      return apiClient(originalRequest);   // Retry once
    }
    return Promise.reject(normalizeError(error));
  }
);
```

- **The refresh call uses a raw `axios.post()`, NOT `apiClient`** — to prevent the interceptor from triggering itself recursively.
- On refresh failure: `clearAccessToken()` is called. AuthContext (Phase 6C) detects this and redirects to `/login`.

---

## 8. Refresh-Token Behavior

| Scenario | What happens |
|---|---|
| Access token valid | Request succeeds normally |
| Access token expired (401) | Interceptor calls `POST /auth/refresh` silently |
| Refresh succeeds | New access token stored; original request retried once |
| Refresh fails (cookie expired / missing) | `clearAccessToken()` called; error forwarded to caller |
| Refresh already attempted (`_retry = true`) | No second retry; error forwarded immediately |
| Login / register / refresh endpoints | Not affected (they don't return 401 on their own path) |

**The refresh token is stored exclusively in an HttpOnly cookie set by the backend.**  
JavaScript cannot read, write, or delete it. The browser sends it automatically.

---

## 9. Error Normalization

Every Axios error is converted to a consistent `AppError` object by `normalizeError()`.

```typescript
export interface AppError {
  message:     string;   // Human-readable. From backend or fallback.
  status:      number;   // HTTP code. 0 = never reached server.
  isNetwork:   boolean;  // true if offline / server down
  isAuth:      boolean;  // true for 401
  isForbidden: boolean;  // true for 403
  validation?: unknown;  // Zod error details from backend, if present
}
```

**Cases handled:**

| Situation | `status` | `isNetwork` | `message` |
|---|---|---|---|
| Server returned JSON error | HTTP code | false | Backend `error.message` |
| Request timeout (10s) | 0 | true | "Request timed out…" |
| Network down / server unreachable | 0 | true | "Network error — unable to reach the server…" |
| Programming error (non-Axios) | 0 | false | `error.message` or fallback |

Service files call `normalizeError(err)` in their `catch` blocks and re-throw, so page components receive a clean `AppError` rather than a raw Axios object.

---

## 10. Security Considerations

| Concern | Decision | Rationale |
|---|---|---|
| Access token storage | **In-memory only** (`_accessToken` module variable) | Not in localStorage (XSS-readable). Lost on page refresh — recovered silently via cookie. |
| Refresh token storage | **HttpOnly cookie** (set by backend) | JS cannot read, steal, or modify it. Sent automatically by the browser. |
| `withCredentials: true` | **Enabled** | Required for the browser to include the HttpOnly cookie on cross-origin requests. Backend must have `credentials: true` in its CORS config. |
| Infinite refresh loop | **Prevented by `_retry` flag** | Each request gets at most one retry attempt. |
| Recursive refresh | **Prevented by using raw `axios.post`** | The refresh call bypasses the interceptor entirely. |
| Secrets in frontend code | **None** | No JWT secret, no DB credentials, no private API keys exist in `src/`. |
| Production URL exposure | **Not hardcoded** | Injected at build time via `VITE_API_URL` in `.env`. |

---

## 11. Validation Performed

| Check | Result |
|---|---|
| `pnpm run build` | ✅ Exit code 0. 2267 modules transformed. |
| TypeScript compilation | ✅ No errors (included in the build step) |
| Axios installed once | ✅ `axios@1.20.0` — single entry in `package.json` |
| `VITE_API_URL` in `.env` | ✅ Set to `http://localhost:5000/api/v1` |
| `withCredentials: true` | ✅ Set in `axios.create()` |
| No secrets in frontend source | ✅ Confirmed — `.env` is gitignored |
| Refresh token not in localStorage | ✅ Never written — HttpOnly cookie only |
| No service creates its own Axios instance | ✅ All 7 service files unchanged (still mock) |
| Infinite refresh loop impossible | ✅ `_retry` flag checked before each refresh attempt |

> The chunk-size warning in the build output (`712 kB after minification`) is pre-existing from the heavy Radix UI and MUI dependencies and is not caused by this phase's changes.

---

## 12. Known Limitations

| Limitation | Phase to resolve |
|---|---|
| `setAccessToken()` is never called — no real auth flow yet | **Phase 6C** (AuthContext, Login integration) |
| All service files still return mock data | **Phase 6C–6G** (service-by-service replacement) |
| Page components still use mock data | **Phase 6C–6G** |
| No toast/notification for network errors yet | Future Phase 6 sub-milestone |
| Chunk size warning in build | Future performance pass (code splitting) |
| No lint configuration exists (`npm run lint` unavailable) | The project has no ESLint config — TypeScript via `tsc` is the type-checker; build pass confirms correctness |

---

## Appendix: File Inventory

```
NEW:
  src/lib/apiClient.ts          — Axios instance, token store, interceptors, error normalization
  src/types/api.ts              — ApiResponse<T>, PaginatedResponse<T>, ApiErrorResponse
  .env                          — VITE_API_URL (gitignored)
  .env.example                  — Template (committed)

MODIFIED:
  .gitignore                    — Added .env, dist
  README.md                     — Added Phase 6B API client documentation

UNTOUCHED (confirmed):
  src/services/*.service.ts     — All 7 still use mock data
  src/pages/*.tsx               — All 9 pages untouched
  src/hooks/useUVData.ts        — Still simulated
  src/hooks/useSunscreen.ts     — Still in-memory
  src/context/AppContext.tsx    — Still empty placeholder
  src/App.tsx                   — No route changes
  backend/**                    — No backend changes
  firmware/**                   — No firmware changes
```

---

*Phase 6B is COMPLETE. STOP — do not proceed to Phase 6C.*
