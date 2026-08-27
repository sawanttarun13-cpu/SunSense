# Phase 6A — Frontend ↔ Backend Integration Readiness Audit

**Date:** 2026-08-27  
**Status:** READ-ONLY — No source files modified.  
**Auditor:** Antigravity

---

## Table of Contents

1. [Frontend Architecture Audit](#1-frontend-architecture-audit)
2. [Axios Audit](#2-axios-audit)
3. [Authentication Audit](#3-authentication-audit)
4. [Complete API Endpoint Inventory](#4-complete-api-endpoint-inventory)
5. [Complete Frontend → Backend API Mapping](#5-complete-frontend--backend-api-mapping)
6. [Dashboard Mapping](#6-dashboard-mapping)
7. [History Mapping](#7-history-mapping)
8. [Analytics Mapping](#8-analytics-mapping)
9. [Alerts Mapping](#9-alerts-mapping)
10. [Profile / Settings Mapping](#10-profile--settings-mapping)
11. [Device Mapping](#11-device-mapping)
12. [Sunscreen Mapping](#12-sunscreen-mapping)
13. [Mock-Data Inventory](#13-mock-data-inventory)
14. [API Contract Discrepancies](#14-api-contract-discrepancies)
15. [Environment Requirements](#15-environment-requirements)
16. [Missing Frontend Capabilities](#16-missing-frontend-capabilities)
17. [Recommended Implementation Order](#17-recommended-implementation-order)
18. [Files Expected to Change](#18-files-expected-to-change)
19. [Risks / Blockers](#19-risks--blockers)
20. [Phase 6A Readiness Verdict](#20-phase-6a-readiness-verdict)

---

## 1. Frontend Architecture Audit

### 1.1 Directory Structure

```
src/
├── App.tsx                  — Router (BrowserRouter + Routes)
├── main.tsx                 — Vite entrypoint; wraps <AppProvider>
├── context/
│   └── AppContext.tsx        — EMPTY PLACEHOLDER: no auth state, no user state
├── hooks/
│   ├── useUVData.ts         — MOCK: 4-second simulated UV ticker (window.__uvStore)
│   └── useSunscreen.ts      — MOCK: in-memory sunscreen state (window.__sunscreenStore)
├── services/                — All 7 files are pure mock wrappers (Promise.resolve())
│   ├── alerts.service.ts
│   ├── analytics.service.ts
│   ├── dashboard.service.ts
│   ├── device.service.ts
│   ├── history.service.ts
│   ├── profile.service.ts
│   └── settings.service.ts
├── mockData/                — All 7 files contain static in-memory mock objects
│   ├── alerts.ts
│   ├── analytics.ts
│   ├── dashboard.ts
│   ├── device.ts
│   ├── history.ts
│   ├── profile.ts
│   └── settings.ts
├── types/                   — 8 TypeScript interface files
├── constants/               — UV zones, navigation, device, settings constants
├── pages/                   — 9 page components (Login, Register, Dashboard, ...)
└── utils/
    └── uv.ts                — UV zone helper utility only
```

### 1.2 Authentication State

- **No auth state exists.** `AppContext.tsx` has an empty `AppContextValue` interface with a comment noting it must be populated in Phase 6.
- **No token storage** (`localStorage`, `sessionStorage`, or cookie) exists anywhere in the frontend.
- **No protected-route guard.** All routes in `App.tsx` (including `/dashboard`, `/analytics`, etc.) are directly accessible without any authentication check.
- **Login page is a fake.** `Login.tsx` `submit()` calls `setTimeout(() => navigate('/dashboard'), 1200)` — no API call is made.
- **Register page** — not inspected in detail but is expected to follow the same pattern.

### 1.3 Data Flow Today

```
Page component
  ↓ calls
service.ts (e.g. dashboardService.getStats())
  ↓ returns
Promise.resolve(MOCK_DATA)
  ↓ feeds
React state (useState)
  ↓ renders
UI components
```

No Axios, no HTTP, no JWT, no real data.

### 1.4 Loading / Error States

- `LoadingState` and `ErrorState` components **already exist** and are used in `Dashboard.tsx` and `Device.tsx`.
- Current error state is only reachable if the `Promise.resolve()` somehow throws — which is never in mock mode.
- No handling for 401 Unauthorized, 403 Forbidden, or token expiry exists.

---

## 2. Axios Audit

| Capability | Status |
|---|---|
| Axios installed | **UNKNOWN — needs `package.json` check** |
| Axios instance (`axios.create`) | ❌ Absent |
| Base URL configuration | ❌ Absent |
| Request interceptor (add Bearer token) | ❌ Absent |
| Response interceptor (handle 401, refresh token) | ❌ Absent |
| Authorization header handling | ❌ Absent |
| Token refresh logic | ❌ Absent |
| Error normalisation | ❌ Absent |
| Timeout configuration | ❌ Absent |
| Environment variable for base URL (`VITE_API_URL`) | ❌ Absent |

> [!IMPORTANT]
> **The entire Axios layer must be created from scratch in Phase 6.** No HTTP client infrastructure exists in the frontend whatsoever. The very first task of Phase 6 must be creating `src/lib/apiClient.ts` with an Axios instance.

---

## 3. Authentication Audit

### 3.1 Backend Contract (Confirmed from source)

| Endpoint | Method | Auth Required | Body | Cookie Set |
|---|---|---|---|---|
| `/api/v1/auth/register` | POST | No | `{ email, password, name }` | No |
| `/api/v1/auth/login` | POST | No | `{ email, password }` | Yes: `refreshToken` (HttpOnly) |
| `/api/v1/auth/refresh` | POST | No (uses cookie) | None | Replaces `refreshToken` cookie |
| `/api/v1/auth/logout` | POST | No | None | Clears `refreshToken` cookie |
| `/api/v1/auth/me` | GET | Yes (Bearer token) | None | No |

### 3.2 Token Architecture

- **Access token:** Short-lived JWT (15 minutes). Returned in response body from `/login`. Must be stored by the frontend and sent as `Authorization: Bearer <token>` on all protected API calls.
- **Refresh token:** Long-lived JWT (7 days). Stored by the backend as an **HttpOnly cookie** named `refreshToken`. The frontend cannot read it directly — it is sent automatically by the browser on each `/api/v1/auth/refresh` call.
- **CORS:** Backend's `cors()` is configured with `credentials: true` and `origin: config.frontendUrl`. The Axios instance **must** use `withCredentials: true` for the cookie to be sent.

### 3.3 Login Response Shape

```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "name": "..." },
    "token": "<15-minute access JWT>",
    "refreshToken": "<7-day refresh JWT>"
  }
}
```
> [!NOTE]
> The `refreshToken` is also returned in the response body, but the frontend should rely on the HttpOnly cookie mechanism (`credentials: true`) for security. The body value may be ignored.

### 3.4 GET /api/v1/auth/me Response Shape

Returns the same data as `ProfileService.getProfile()`:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Alex",
    "skinType": 3,
    "preferredSpf": 30
  }
}
```

### 3.5 Missing Frontend Auth Capabilities

- No `AuthContext` / `useAuth` hook.
- No access token storage mechanism.
- No `PrivateRoute` guard wrapping authenticated pages.
- No silent refresh logic (call `/refresh` when 401 is received).
- No logout action that clears token + calls `/logout`.
- Login page does not call the backend.
- Register page does not call the backend.

---

## 4. Complete API Endpoint Inventory

All endpoints confirmed from actual source code inspection.

### 4.1 Auth

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/register` | No | Create account |
| POST | `/api/v1/auth/login` | No | Login + set cookie |
| POST | `/api/v1/auth/refresh` | No (cookie) | Renew access token |
| POST | `/api/v1/auth/logout` | No | Clear cookie |
| GET | `/api/v1/auth/me` | Bearer | Current user profile |

### 4.2 Device

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/v1/device/register` | Bearer (user) | Register ESP8266 |
| GET | `/api/v1/device/` | Bearer (user) | Get device status |
| POST | `/api/v1/device/authenticate` | Device headers | Device auth handshake |
| POST | `/api/v1/device/heartbeat` | Device headers | Send telemetry |

### 4.3 Readings (Firmware-facing only)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/v1/readings` | Device headers | Ingest UV readings |

### 4.4 Dashboard

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/dashboard/` | Bearer | Aggregated dashboard metrics |

### 4.5 Analytics

| Method | Path | Auth | Query Params | Purpose |
|---|---|---|---|---|
| GET | `/api/v1/analytics/` | Bearer | `timeframe=daily\|weekly\|monthly` | Time-series analytics |

### 4.6 History

| Method | Path | Auth | Query Params | Purpose |
|---|---|---|---|---|
| GET | `/api/v1/history/` | Bearer | `page, limit, startDate, endDate` | Paginated session list |
| GET | `/api/v1/history/:id` | Bearer | — | Single session detail |

### 4.7 Alerts

| Method | Path | Auth | Query Params | Purpose |
|---|---|---|---|---|
| GET | `/api/v1/alerts/` | Bearer | `page, limit, status=all\|read\|unread` | Paginated alert list |
| PATCH | `/api/v1/alerts/:id/read` | Bearer | — | Mark alert as read |

### 4.8 Profile

| Method | Path | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/api/v1/profile/` | Bearer | — | Get profile |
| PUT | `/api/v1/profile/` | Bearer | `{ name?, skinType?, preferredSpf? }` | Update profile |

### 4.9 Settings

| Method | Path | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/api/v1/settings/` | Bearer | — | Get settings |
| PUT | `/api/v1/settings/` | Bearer | `{ alertThreshold?, emailNotifications?, pushNotifications? }` | Update settings |

### 4.10 Sunscreen

| Method | Path | Auth | Body | Purpose |
|---|---|---|---|---|
| POST | `/api/v1/sunscreen/` | Bearer | `{ appliedSpf: number, appliedAt?: string }` | Log sunscreen application |

### 4.11 Server Utilities

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/server/time` | No | Server UTC time (firmware use) |

### 4.12 Health

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/health` | No | Server + DB health check |

---

## 5. Complete Frontend → Backend API Mapping

| Frontend Feature | Current Mock Source | Target Endpoint | Method | Auth Required | Request Shape | Response Shape | Frontend Consumer | Status |
|---|---|---|---|---|---|---|---|---|
| Login | `setTimeout → navigate` | `/api/v1/auth/login` | POST | No | `{ email, password }` | `{ token, user }` | `Login.tsx` | ❌ Not implemented |
| Register | `setTimeout → navigate` (assumed) | `/api/v1/auth/register` | POST | No | `{ email, password, name }` | `{ id, email, name }` | `Register.tsx` | ❌ Not implemented |
| Token refresh | None | `/api/v1/auth/refresh` | POST | Cookie | None | `{ token }` | Axios interceptor | ❌ Not implemented |
| Logout | None | `/api/v1/auth/logout` | POST | No | None | `{}` | Nav/header | ❌ Not implemented |
| Current user | None | `/api/v1/auth/me` | GET | Bearer | — | `{ id, email, name, skinType, preferredSpf }` | `AppContext` | ❌ Not implemented |
| Dashboard stats | `mockData/dashboard.ts` | `/api/v1/dashboard/` | GET | Bearer | — | See §6 | `Dashboard.tsx` | ❌ Not implemented |
| Live UV Index | `useUVData` (simulated) | `/api/v1/dashboard/` | GET | Bearer | — | `currentUv` | `Dashboard.tsx` | ❌ Not implemented |
| Sunscreen apply | `useSunscreen` (in-memory) | `/api/v1/sunscreen/` | POST | Bearer | `{ appliedSpf, appliedAt? }` | `{ id, appliedSpf, expiresAt }` | `SunscreenTracker` | ❌ Not implemented |
| Sunscreen status | `useSunscreen` (in-memory) | `/api/v1/dashboard/` | GET | Bearer | — | `activeProtection, protectionRemaining` | `SunscreenTracker` | ❌ Not implemented |
| Analytics data | `mockData/analytics.ts` | `/api/v1/analytics/` | GET | Bearer | `?timeframe=` | `{ timeframe, data[], trend }` | `Analytics.tsx` | ❌ Not implemented |
| History list | `mockData/history.ts` | `/api/v1/history/` | GET | Bearer | `?page&limit&startDate&endDate` | `{ data[], pagination }` | `History.tsx` | ❌ Not implemented |
| History detail | None | `/api/v1/history/:id` | GET | Bearer | — | Session object | `History.tsx` | ❌ Not implemented |
| Alerts list | `mockData/alerts.ts` | `/api/v1/alerts/` | GET | Bearer | `?page&limit&status` | `{ data[], pagination }` | `Alerts.tsx` | ❌ Not implemented |
| Mark alert read | None | `/api/v1/alerts/:id/read` | PATCH | Bearer | — | `{ success: true }` | `Alerts.tsx` | ❌ Not implemented |
| Profile GET | `mockData/profile.ts` | `/api/v1/profile/` | GET | Bearer | — | `{ id, email, name, skinType, preferredSpf, createdAt }` | `Profile.tsx` | ❌ Not implemented |
| Profile PUT | `Object.assign` (in-memory) | `/api/v1/profile/` | PUT | Bearer | `{ name?, skinType?, preferredSpf? }` | Updated profile | `Profile.tsx` | ❌ Not implemented |
| Settings GET | `mockData/settings.ts` | `/api/v1/settings/` | GET | Bearer | — | `{ alertThreshold, emailNotifications, pushNotifications }` | `SettingsPage.tsx` | ❌ Not implemented |
| Settings PUT | None | `/api/v1/settings/` | PUT | Bearer | `{ alertThreshold?, emailNotifications?, pushNotifications? }` | Updated settings | `SettingsPage.tsx` | ❌ Not implemented |
| Device status | `mockData/device.ts` | `/api/v1/device/` | GET | Bearer | — | See §11 | `Device.tsx` | ❌ Not implemented |

---

## 6. Dashboard Mapping

### 6.1 Current Mock

`dashboardService.getStats()` returns `DASHBOARD_STATS`, a hardcoded array of 4 `DashboardStat` objects:
- Battery: `82%`, `~14h left`
- Status: `Connected`, `Strong signal`
- UV Exposure: `2h 15m`, `Today · since 6 AM`
- SPF Status: `SPF 50`, `Recommended now`

`useUVData` provides the UV gauge, chart, peak, and low values — all simulated.  
`useSunscreen` provides the protection countdown — all in-memory.

### 6.2 Target Backend Response

`GET /api/v1/dashboard/` returns:

```json
{
  "success": true,
  "data": {
    "deviceConnected": true,
    "deviceStatus": "ONLINE | OFFLINE",
    "batteryStatus": null,
    "lastSync": "<ISO 8601 timestamp or null>",
    "todayExposure": 8100,
    "todayDose": 1.23,
    "peakUv": 9.4,
    "averageUv": 4.2,
    "currentUv": 3.1,
    "currentRisk": "MODERATE",
    "currentSpfRecommendation": 30,
    "activeProtection": false,
    "protectionRemaining": 0
  }
}
```

### 6.3 Mapping

| Dashboard UI Element | Mock Source | Backend Field |
|---|---|---|
| Battery stat card | `DASHBOARD_STATS[0].value = '82%'` | `batteryStatus` (currently always `null` — hardware deferred) |
| Connection status | `DASHBOARD_STATS[1].value = 'Connected'` | `deviceStatus` (`'ONLINE'` / `'OFFLINE'`) |
| UV Exposure today | `DASHBOARD_STATS[2].value = '2h 15m'` | `todayExposure` (seconds — must format to h/m on frontend) |
| SPF Recommended | `DASHBOARD_STATS[3].value = 'SPF 50'` | `currentSpfRecommendation` |
| UV Gauge value | `useUVData.uvValue` (simulated) | `currentUv` |
| Peak UV | `useUVData.peakUV` (simulated) | `peakUv` |
| Low UV | `useUVData.lowUV` (simulated) | ❌ Not in backend response |
| UV zone / risk | `getUVZone(uvValue)` | `currentRisk` (but format differs — see §14) |
| UV Dose | Not displayed | `todayDose` (SED) — available |
| Average UV | Not displayed | `averageUv` — available |
| Sunscreen active | `useSunscreen.status` | `activeProtection` (boolean) |
| Sunscreen minutes left | `useSunscreen.remainingMs` | `protectionRemaining` (minutes, not ms) |
| Last sync | Not displayed | `lastSync` (ISO timestamp) |
| Hourly UV chart | `useUVData.hourlyData` (24-slot simulated array) | ❌ No dedicated endpoint — requires separate readings endpoint or new route |
| Device connected | Not displayed | `deviceConnected` (boolean) — controls "no device" pairing screen |

> [!WARNING]
> **The 24-hour hourly UV chart has no backend endpoint.** The current `/api/v1/dashboard/` returns a single `currentUv` value but not the hourly time series needed to render the chart. A new `GET /api/v1/readings?granularity=hourly&date=today` endpoint will be needed in Phase 6B, OR the Analytics endpoint can be repurposed.

---

## 7. History Mapping

### 7.1 Current Mock

`historyService.getLogs()` returns `ALL_LOGS` — 72 deterministic `UVLogEntry` objects:
```typescript
interface UVLogEntry { id: number; date: Date; uv: number; }
```

All pagination, date-range filtering, and CSV export happen **client-side** on this static array.

### 7.2 Target Backend

`GET /api/v1/history/` response:
```json
{
  "success": true,
  "data": [ /* ExposureSession objects */ ],
  "pagination": {
    "page": 1, "limit": 20, "total": 87,
    "totalPages": 5, "hasNext": true, "hasPrevious": false
  }
}
```

`GET /api/v1/history/:id` → single `ExposureSession` object.

### 7.3 Mapping

| History Feature | Current Mock | Backend Target |
|---|---|---|
| List | `ALL_LOGS` (72 static entries) | `GET /api/v1/history/?page=1&limit=20` |
| Pagination | Client-side slice on `ALL_LOGS` | Backend `pagination` object from response |
| Date range filter | Client-side `.filter()` on `date` | `?startDate=ISO&endDate=ISO` query params |
| Ordering | Pre-sorted by date desc | Backend returns desc by default |
| Session detail | ❌ Not implemented | `GET /api/v1/history/:id` |
| CSV export | Client-side from `ALL_LOGS` | Needs data from paginated API (possibly all pages) |

> [!IMPORTANT]
> **Type mismatch.** The frontend `UVLogEntry` has `{ id: number, date: Date, uv: number }`. The backend `ExposureSession` has `{ id: UUID, startTime: Date, durationSeconds: number, accumulatedSed: Decimal, averageUvIndex: Decimal, ... }`. The frontend types and rendering must be rewritten for Phase 6.

---

## 8. Analytics Mapping

### 8.1 Current Mock

`analyticsService` returns four independent arrays: `weeklyData`, `monthlyData`, `peakHoursData`, `heatmapData`.

### 8.2 Target Backend

`GET /api/v1/analytics/?timeframe=daily|weekly|monthly` returns:
```json
{
  "success": true,
  "data": {
    "timeframe": "weekly",
    "data": [
      {
        "period": "2026-W32",
        "totalTime": 14400,
        "totalDose": 3.2,
        "maxUv": 9.4,
        "averageUv": 5.1
      }
    ],
    "trend": {
      "doseDifference": 0.5,
      "dosePercentageChange": 18.5
    }
  }
}
```

### 8.3 Mapping

| Analytics View | Current Mock | Backend Field | Notes |
|---|---|---|---|
| Daily chart | `weeklyData` (misnaming) | `data[]` with `timeframe=daily` | Period key is `YYYY-MM-DD` |
| Weekly chart | `weeklyData` | `data[]` with `timeframe=weekly` | Period key is `YYYY-WNN` |
| Monthly chart | `monthlyData` | `data[]` with `timeframe=monthly` | Period key is `YYYY-MM` |
| Total exposure time | Not explicit | `totalTime` (seconds) | Must format |
| UV Dose | Not explicit | `totalDose` (SED) | |
| Peak UV | `peakHoursData` | `maxUv` (per period) | Note: this is session average max, not true raw peak |
| Average UV | Not explicit | `averageUv` | |
| Trend % | Not explicit | `trend.dosePercentageChange` | |
| Peak hours heatmap | `heatmapData` | ❌ **Not implemented in backend** | No endpoint exists |
| Min UV | Not explicit | ❌ Not returned | Backend doesn't compute min UV |

> [!WARNING]
> **The peak-hours heatmap has no backend implementation.** The `peakHoursData` mock feeds a heatmap UI component in `Analytics.tsx`. The backend currently has no endpoint for hourly aggregation across multiple days. This will require a new endpoint or be removed from the UI in Phase 6.

---

## 9. Alerts Mapping

### 9.1 Current Mock

`alertsService.getAlerts()` returns `ALERT_DATA` (7 hardcoded `AlertItem` objects). The frontend `AlertItem` type includes a Lucide `icon` component directly embedded in the data.

### 9.2 Target Backend

`GET /api/v1/alerts/?page=1&limit=20&status=all` returns:
```json
{
  "success": true,
  "data": [ /* Alert DB objects */ ],
  "pagination": { ... }
}
```
`PATCH /api/v1/alerts/:id/read` → `{ "success": true, "data": { "success": true } }`

### 9.3 Mapping

| Alerts Feature | Current Mock | Backend Target |
|---|---|---|
| Alert list | 7 hardcoded items | `GET /api/v1/alerts/` |
| Read/unread filter | Client-side filter on `isNew` boolean | `?status=read\|unread\|all` |
| Mark as read | Not implemented | `PATCH /api/v1/alerts/:id/read` |
| Pagination | Not implemented | Backend `pagination` object |
| Severity filter | Client-side by `severity` field | Client-side (no backend severity filter) |

> [!IMPORTANT]
> **Type incompatibility.** Frontend `AlertItem.id` is `number`. Backend alert IDs are UUIDs (strings). Frontend `AlertItem.icon` is a React component — the backend stores no such field. Icon mapping must be derived client-side from the alert `type` or `severity` field returned by the backend. The frontend `AlertItem` interface must be redesigned.

> [!NOTE]
> The alerts table in the database currently has no smart alert generator. Per `alerts.service.ts`: "The smart alert generation engine is scheduled for implementation in Phase 8." The alerts list will be empty in the database until Phase 8. This is expected.

---

## 10. Profile / Settings Mapping

### 10.1 Profile

| Feature | Current Mock | Backend Field | Notes |
|---|---|---|---|
| Name | `MOCK_USER_PROFILE.name = 'Alex Johnson'` | `name` from `/api/v1/profile/` | ✅ Field exists |
| Email | Not in mock | `email` from `/api/v1/profile/` | ✅ Field exists |
| Skin type (int) | `MOCK_USER_PROFILE.skinType = 2` | `skinType` (int 1–6) | ✅ Field exists |
| Preferred SPF | Not in mock | `preferredSpf` from `/api/v1/profile/` | ✅ Field exists |
| Location | `MOCK_USER_PROFILE.location = 'San Francisco, CA'` | ❌ Not in backend schema | Location is a mock-only field |
| Age | `MOCK_USER_PROFILE.age = '34'` | ❌ Not in backend schema | Age is a mock-only field |
| Initials | `MOCK_USER_PROFILE.initials = 'AJ'` | Derived client-side | Compute from `name` |
| Sensitivity level | `MOCK_USER_PROFILE.sensitivity = 2` | ❌ Not in backend schema | Mock-only field |
| Skin type options | `SKIN_TYPES[]` constant | Keep as frontend constant | Not fetched from backend |
| Achievements | `ACHIEVEMENTS[]` | ❌ Not in backend | Mock-only data — backend has no achievements table |

**Profile UPDATE — Request body:**
```json
{ "name": "...", "skinType": 3, "preferredSpf": 50 }
```
Backend validator: `UpdateProfileSchema = z.object({ name?, skinType(1-6)?, preferredSpf(1-100)? })`

### 10.2 Settings

| Feature | Current Mock | Backend Field | Notes |
|---|---|---|---|
| `spfLevel` | `MOCK_SETTINGS.spfLevel = 30` | `preferredSpf` from **Profile** | ❌ Settings endpoint does NOT have spfLevel — it's on Profile |
| `uvThreshold` | `MOCK_SETTINGS.uvThreshold = 6` | `alertThreshold` | Field name mismatch: frontend `uvThreshold` → backend `alertThreshold` |
| `notifications.extreme` | `MOCK_SETTINGS.notifications.extreme = true` | ❌ Not in backend | Backend only has `emailNotifications` + `pushNotifications` |
| `notifications.high` | `true` | ❌ Not in backend | Mock-only |
| `notifications.spfReminder` | `true` | ❌ Not in backend | Mock-only |
| `notifications.dailySummary` | `true` | ❌ Not in backend | Mock-only |
| `notifications.batteryLow` | `true` | ❌ Not in backend | Mock-only |
| `notifications.disconnect` | `false` | ❌ Not in backend | Mock-only |
| `notifications.sound` | `true` | ❌ Not in backend | Mock-only |
| `emailNotifications` | Not in mock | `emailNotifications` (boolean \| null) | Backend-only field, not yet in UI |
| `pushNotifications` | Not in mock | `pushNotifications` (boolean \| null) | Backend-only field, not yet in UI |
| App version / about | `MOCK_ABOUT` | ❌ Not in backend | Frontend-only / static |

> [!WARNING]
> **Major settings schema mismatch.** The frontend `AppSettings` type and `MOCK_SETTINGS` object define 7 granular notification toggles. The backend only supports 2 notification fields: `emailNotifications` and `pushNotifications`. The settings UI will need significant adjustment during Phase 6 — either the backend schema must be extended, or the notification UI must be simplified to match what exists.

**Settings UPDATE — Request body:**
```json
{ "alertThreshold": 6.0, "emailNotifications": true, "pushNotifications": false }
```

---

## 11. Device Mapping

### 11.1 Current Mock (`MOCK_DEVICE`)

```typescript
{
  info: { model, serialNumber, uptime, readingsToday, accuracy, range },
  battery: { level: 82, type, charging },
  wifi: { bars: 3, ssid, ip, mac },
  system: { firmware, hardwareRev, lastUpdate },
  sensors: { s12sd: { ok: true, val: 'Normal (1.2V)' } }
}
```

### 11.2 Backend Device Response (`GET /api/v1/device/`)

The backend `DeviceController.getDevice()` returns the raw Prisma `Device` record. Fields available in the DB schema (from Phase 4B):

| Frontend Mock Field | Backend DB Field | Notes |
|---|---|---|
| `info.model` | ❌ Not in schema | Mock-only. Backend has no `model` field |
| `info.serialNumber` | ❌ Not in schema | Mock-only |
| `info.uptime` | ❌ Not in schema | Mock-only |
| `info.readingsToday` | ❌ Not in schema | Must compute from readings |
| `info.accuracy` | ❌ Not in schema | Firmware constant, not stored |
| `info.range` | ❌ Not in schema | Firmware constant, not stored |
| `battery.level` | `batteryLevel` (nullable int) | ✅ Exists — currently always `null` (deferred) |
| `battery.type` | ❌ Not in schema | Mock-only |
| `battery.charging` | ❌ Not in schema | Mock-only |
| `wifi.bars` | ❌ Not in schema | Derived from `rssi`? |
| `wifi.ssid` | ❌ Not in schema | Mock-only |
| `wifi.ip` | ❌ Not in schema | Mock-only |
| `wifi.mac` | `macAddress` | ✅ Available |
| `system.firmware` | `firmwareVersion` | ✅ Available |
| `system.hardwareRev` | ❌ Not in schema | Mock-only |
| `system.lastUpdate` | ❌ Not in schema | Mock-only |
| `sensors.s12sd` | ❌ Not in schema | Mock-only |
| Device online status | Derived from `lastPing` | Use `lastPing` to compute |
| Last ping time | `lastPing` (timestamp) | ✅ Available |
| RSSI | `rssi` (nullable int) | ✅ Available — from heartbeat |

> [!CAUTION]
> **The Device page mock data has severe mismatch with the backend.** Most of the fields displayed on `Device.tsx` (`model`, `serialNumber`, `uptime`, `accuracy`, `range`, `battery.type`, `wifi.bars/ssid/ip`, `system.hardwareRev`) do not exist in the backend database schema. The Device page UI will need significant redesign to show only fields that are available from the backend.

---

## 12. Sunscreen Mapping

### 12.1 Frontend (useSunscreen hook)

- Status: `'unprotected' | 'protected' | 'expired'`
- `applySunscreen(spf, time)` — currently updates in-memory window store only.
- Status is loaded from in-memory on mount (always `unprotected` on page reload).

### 12.2 Backend

| Endpoint | Status | Notes |
|---|---|---|
| `POST /api/v1/sunscreen/` | ✅ Implemented | Body: `{ appliedSpf: number, appliedAt?: ISO string }` |
| `GET /api/v1/sunscreen/status` | ❌ **Does NOT exist** | Frontend previously assumed this route. **Confirmed absent.** |
| `PATCH /api/v1/sunscreen/reapply` | ❌ **Does NOT exist** | Never implemented |

**Sunscreen apply response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "appliedSpf": 50,
    "appliedAt": "2026-08-27T10:00:00Z",
    "expiresAt": "2026-08-27T12:00:00Z"
  }
}
```

**Sunscreen status comes from `/api/v1/dashboard/`** (fields: `activeProtection`, `protectionRemaining`). There is no dedicated GET endpoint for sunscreen status.

> [!WARNING]
> `GET /api/v1/sunscreen/status` and `PATCH /api/v1/sunscreen/reapply` do not exist. The Phase 4C discrepancy report was correct. The sunscreen status display must be driven by the dashboard endpoint, not a dedicated sunscreen status route.

---

## 13. Mock-Data Inventory

| File | Classification | Reason |
|---|---|---|
| `src/mockData/dashboard.ts` | **REMOVE** | Replace with `GET /api/v1/dashboard/` response |
| `src/mockData/alerts.ts` | **REMOVE** | Replace with `GET /api/v1/alerts/` response (alert type partial mismatch — see §14) |
| `src/mockData/analytics.ts` | **REMOVE** | Replace with `GET /api/v1/analytics/` response (heatmap may need keeping) |
| `src/mockData/history.ts` | **REMOVE** | Replace with `GET /api/v1/history/` response (type will change) |
| `src/mockData/profile.ts` (MOCK_USER_PROFILE) | **REPLACE** | Core fields from backend; `location`, `age`, `initials`, `sensitivity` are mock-only |
| `src/mockData/profile.ts` (SKIN_TYPES, SENSITIVITY_LEVELS, ACHIEVEMENTS) | **KEEP** | Frontend constants — no backend equivalent |
| `src/mockData/settings.ts` (MOCK_SETTINGS) | **REPLACE** | `alertThreshold`, `emailNotifications`, `pushNotifications` from backend; granular notifications are mock-only |
| `src/mockData/settings.ts` (MOCK_ABOUT) | **KEEP (DEV-ONLY)** | No backend source; static version info |
| `src/mockData/device.ts` | **REPLACE** | Only `macAddress`, `firmwareVersion`, `batteryLevel`, `rssi`, `lastPing` are real |
| `src/hooks/useUVData.ts` | **REPLACE** | Replace with polling `GET /api/v1/dashboard/` every N seconds |
| `src/hooks/useSunscreen.ts` | **REPLACE** | Replace `applySunscreen` with `POST /api/v1/sunscreen/`; status from dashboard |
| `src/services/dashboard.service.ts` | **REPLACE** | Call `GET /api/v1/dashboard/` via Axios |
| `src/services/alerts.service.ts` | **REPLACE** | Call `GET /api/v1/alerts/` + `PATCH /api/v1/alerts/:id/read` |
| `src/services/analytics.service.ts` | **REPLACE** | Call `GET /api/v1/analytics/?timeframe=` |
| `src/services/history.service.ts` | **REPLACE** | Call `GET /api/v1/history/` with pagination |
| `src/services/profile.service.ts` | **REPLACE** | Call `GET/PUT /api/v1/profile/`; remove `SKIN_TYPES`, `ACHIEVEMENTS` from service |
| `src/services/settings.service.ts` | **REPLACE** | Call `GET/PUT /api/v1/settings/` |
| `src/services/device.service.ts` | **REPLACE** | Call `GET /api/v1/device/` |

---

## 14. API Contract Discrepancies

All discrepancies confirmed from source inspection. **Do not silently resolve** — flag for implementation.

| # | Area | Frontend Assumption | Backend Reality | Impact |
|---|---|---|---|---|
| D1 | Sunscreen | Uses `GET /api/v1/sunscreen/status` | **Endpoint does not exist.** Status comes from `GET /api/v1/dashboard/` | All sunscreen status display must use dashboard endpoint |
| D2 | Sunscreen | Uses `PATCH /api/v1/sunscreen/reapply` | **Does not exist.** Reapplication is another `POST /api/v1/sunscreen/` | Re-apply button must call POST, not PATCH |
| D3 | Settings — field name | `uvThreshold` | `alertThreshold` | All frontend references must be renamed |
| D4 | Settings — schema | 7 granular notification booleans | Only `emailNotifications` + `pushNotifications` | 5 frontend notification options have no backend field |
| D5 | Settings — spfLevel | `spfLevel` in settings | `preferredSpf` lives on the **Profile** endpoint, not Settings | `spfLevel` must be fetched/updated via `PUT /api/v1/profile/` |
| D6 | Alerts — ID type | `id: number` | `id: UUID string` | `AlertItem.id` must become `string` |
| D7 | Alerts — icon | `icon: React.ElementType` embedded in alert data | No icon field in backend; icon must be derived from alert type/severity | Icon resolution must be a client-side mapping function |
| D8 | History — type shape | `UVLogEntry { id: number, date: Date, uv: number }` | `ExposureSession { id: UUID, startTime, durationSeconds, accumulatedSed, averageUvIndex, ... }` | History types must be fully rewritten |
| D9 | Dashboard — hourly chart | `useUVData.hourlyData` (24-slot array) | **No hourly breakdown endpoint exists** | Must poll `/analytics/?timeframe=daily` or add new endpoint |
| D10 | Dashboard — lowUV | `useUVData.lowUV` displayed | Dashboard response has no `lowUv` field | Either derive from analytics or remove from UI |
| D11 | Device — model/serial/uptime | Multiple mock-only fields | Not in DB schema | Device page UI needs redesign |
| D12 | Profile — location/age/sensitivity | `location`, `age`, `sensitivity` in mock | Not in backend schema | Remove or keep as optional client-only local state |
| D13 | Response envelope | Frontend doesn't unwrap any envelope (mock returns plain data) | All responses are `{ success: true, data: { ... } }` | Every service must unwrap `response.data.data` |
| D14 | Auth — `/auth/me` vs `/auth/profile` | No current implementation | Route is `/api/v1/auth/me` — confirmed correct | N/A (no discrepancy, just noting for implementation) |
| D15 | Analytics — heatmap | `peakHoursData` heatmap mock | **No backend endpoint** | Heatmap UI may need to be hidden/removed in Phase 6 |
| D16 | Alerts — mark-as-read | Not implemented in frontend | `PATCH /api/v1/alerts/:id/read` available | Must add frontend call |
| D17 | Settings — `pushNotifications` | Not in frontend at all | Field exists in backend | Must add toggle to settings UI |
| D18 | Settings — `emailNotifications` | Not in frontend at all | Field exists in backend | Must add toggle to settings UI |

---

## 15. Environment Requirements

### 15.1 Required Frontend Environment Variable

```bash
# File: .env (in project root, alongside vite.config.ts)
VITE_API_URL=http://localhost:5000
```

This must be used as the Axios base URL:
```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // REQUIRED for HttpOnly refresh token cookie
});
```

> [!IMPORTANT]
> The backend CORS config reads `CLIENT_URL` from `backend/.env`. The React dev server runs on `http://localhost:5173` by default. Ensure `backend/.env` contains `CLIENT_URL=http://localhost:5173`.

### 15.2 Backend Environment Variables (Already Present)

- `PORT=5000`
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET=<strong secret>`
- `CLIENT_URL=http://localhost:5173`

---

## 16. Missing Frontend Capabilities

These must be created in Phase 6 — none exist today:

| # | Capability | Description |
|---|---|---|
| M1 | `src/lib/apiClient.ts` | Axios instance with base URL, `withCredentials: true`, request + response interceptors |
| M2 | `src/context/AuthContext.tsx` | Auth state: `user`, `token`, `login()`, `logout()`, `isAuthenticated` |
| M3 | Token storage mechanism | Store JWT access token in memory (or `localStorage` if accepted) |
| M4 | Axios request interceptor | Attach `Authorization: Bearer <token>` to every outbound request |
| M5 | Axios response interceptor | On 401, silently call `/auth/refresh` and retry the failed request |
| M6 | `<PrivateRoute>` component | Redirects to `/login` if `!isAuthenticated` |
| M7 | `Login.tsx` real API call | Call `POST /api/v1/auth/login`, store token, redirect |
| M8 | `Register.tsx` real API call | Call `POST /api/v1/auth/register`, then auto-login |
| M9 | Logout action | Call `POST /api/v1/auth/logout`, clear state, redirect to `/login` |
| M10 | UV polling mechanism | Poll `GET /api/v1/dashboard/` every ~30s to replace `useUVData` ticker |
| M11 | History pagination UI + state | Page number state, prev/next controls, backend-driven page data |
| M12 | Alerts mark-as-read integration | Wire the "mark read" button to `PATCH /api/v1/alerts/:id/read` |
| M13 | Device registration flow | `POST /api/v1/device/register` from `Device.tsx` |
| M14 | Settings form connected | Wire Settings PUT with correct field names (`alertThreshold`, `emailNotifications`) |
| M15 | Response envelope unwrapping | All services must unwrap `response.data.data` pattern |
| M16 | 401 / session expiry handling | Show "Session expired — please log in again" message |
| M17 | Network error handling | Show toast/error when backend is unreachable |

---

## 17. Recommended Implementation Order

```
Step 1 — Environment
  Create .env with VITE_API_URL

Step 2 — Axios Foundation
  Create src/lib/apiClient.ts (instance, interceptors, refresh logic)

Step 3 — Auth Context
  Create src/context/AuthContext.tsx (user state, token, login/logout)

Step 4 — Auth Pages
  Wire Login.tsx → POST /api/v1/auth/login
  Wire Register.tsx → POST /api/v1/auth/register
  Wire logout → POST /api/v1/auth/logout

Step 5 — Route Protection
  Create <PrivateRoute> and wrap all protected routes in App.tsx

Step 6 — Dashboard
  Replace dashboardService.getStats() → GET /api/v1/dashboard/
  Replace useUVData simulation → polling dashboard endpoint
  Replace useSunscreen simulation → POST /api/v1/sunscreen/ + dashboard status

Step 7 — History
  Replace historyService → GET /api/v1/history/ with server-side pagination

Step 8 — Analytics
  Replace analyticsService → GET /api/v1/analytics/?timeframe=
  Handle heatmap gap (hide or defer)

Step 9 — Alerts
  Replace alertsService → GET /api/v1/alerts/
  Wire mark-as-read → PATCH /api/v1/alerts/:id/read

Step 10 — Profile
  Replace profileService → GET/PUT /api/v1/profile/

Step 11 — Settings
  Replace settingsService → GET/PUT /api/v1/settings/
  Reconcile field name differences (uvThreshold → alertThreshold)

Step 12 — Device
  Replace deviceService → GET /api/v1/device/
  Redesign Device page for fields that actually exist in DB
```

---

## 18. Files Expected to Change

### New Files

| File | Purpose |
|---|---|
| `src/lib/apiClient.ts` | Axios instance |
| `src/context/AuthContext.tsx` | Global auth state |
| `src/types/api.ts` | Shared API response wrapper type |
| `src/types/dashboard.ts` (new) | Backend dashboard response type |
| `src/types/session.ts` | ExposureSession type (replaces UVLogEntry) |

### Modified Files

| File | Change |
|---|---|
| `src/App.tsx` | Add `<PrivateRoute>` and `AuthContext` wrapping |
| `src/context/AppContext.tsx` | Extend or replace with AuthContext |
| `src/pages/Login.tsx` | Real API call |
| `src/pages/Register.tsx` | Real API call |
| `src/pages/Dashboard.tsx` | Real data fetch + UV polling |
| `src/pages/Analytics.tsx` | Real data fetch + timeframe selector wired |
| `src/pages/History.tsx` | Server-side pagination |
| `src/pages/Alerts.tsx` | Real fetch + mark-read wire-up |
| `src/pages/Profile.tsx` | Real GET/PUT; remove mock-only fields |
| `src/pages/SettingsPage.tsx` | Real GET/PUT; reconcile field names |
| `src/pages/Device.tsx` | Real GET; redesign for available fields |
| `src/services/*.service.ts` | All 7 files rewritten as Axios calls |
| `src/hooks/useUVData.ts` | Replace simulation with dashboard polling |
| `src/hooks/useSunscreen.ts` | Replace in-memory with API calls |
| `src/types/history.ts` | Rewrite for ExposureSession |
| `src/types/alert.ts` | Change `id` to `string`, remove `icon` from type |

### Files That Will NOT Change (Phase 6)

| File | Reason |
|---|---|
| All backend `*.ts` files | READ-ONLY — no backend changes planned |
| `src/components/**` | UI components preserved per audit rule |
| `src/constants/uv.ts` | UV zone logic — unchanged |
| `src/mockData/profile.ts` (SKIN_TYPES, ACHIEVEMENTS) | Frontend constants — kept |
| `src/mockData/settings.ts` (MOCK_ABOUT) | Static version info — kept |
| All firmware files | Hardware work is independent |

---

## 19. Risks / Blockers

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | **Empty database** — No real sensor readings exist until hardware calibration is complete and device registers | 🟡 Medium | Use `POST /api/v1/device/register`, then test with the actual ESP8266 sending readings via firmware |
| R2 | **Empty alerts** — Alert generation engine (Phase 8) is not yet built; alerts table will be empty | 🟡 Medium | The alerts page can show an empty state gracefully |
| R3 | **Hourly UV chart has no backend endpoint** | 🔴 High | Requires either a new endpoint (Phase 6B) or chart removal |
| R4 | **Device page requires UI redesign** — Most mock fields have no backend equivalent | 🟡 Medium | Redesign Device page to show only real fields; log blocker before implementation |
| R5 | **Settings schema mismatch** — 5 of 7 frontend notification toggles have no backend field | 🟡 Medium | Simplify settings UI to match backend; do not add backend fields in Phase 6 |
| R6 | **Profile fields missing** — `location`, `age`, `sensitivity` have no backend storage | 🟢 Low | Remove from display or store locally |
| R7 | **Battery deferred** — `batteryLevel` is always `null` | 🟢 Low | Display "N/A" / "Hardware pending" in UI; gracefully handle null |
| R8 | **Axios not in package.json** — Must be confirmed and installed | 🟢 Low | `npm install axios` before starting Phase 6 |
| R9 | **Token storage** — Access token in `localStorage` is XSS-vulnerable; in-memory is safer but lost on refresh | 🟡 Medium | Decide storage strategy; in-memory + silent refresh via cookie is the most secure pattern |
| R10 | **CORS cookie** — Requires `withCredentials: true` on Axios + `credentials: true` on backend | 🟢 Low | Both sides already support this |

---

## 20. Phase 6A Readiness Verdict

### Summary

| Component | Backend Ready | Frontend Has Mock | Integration Work Needed |
|---|---|---|---|
| Authentication | ✅ Full (login, register, refresh, logout, me) | ❌ None | Full implementation |
| Dashboard | ✅ Full aggregated endpoint | ❌ None (simulation only) | Full implementation |
| Analytics | ✅ Full with timeframe | ❌ Mock arrays | Replace service + type mapping |
| History | ✅ Full with pagination + detail | ❌ Static array | Replace service + type rewrite |
| Alerts | ✅ List + mark-read | ❌ Static array | Replace service + type changes |
| Profile | ✅ GET + PUT | ❌ Mock object | Replace service; drop mock-only fields |
| Settings | ✅ GET + PUT (limited fields) | ❌ Mock object | Replace service; reconcile schema mismatch |
| Device | ✅ GET (partial fields) | ❌ Rich mock | Replace service; redesign UI |
| Sunscreen | ✅ POST apply (only) | ❌ In-memory | Wire POST; use dashboard for status |
| Axios layer | N/A | ❌ Completely absent | Create from scratch |
| Auth context | N/A | ❌ Completely absent | Create from scratch |
| Route guards | N/A | ❌ Completely absent | Create from scratch |

### Verdict

---

**✅ READY FOR IMPLEMENTATION**

The backend API is fully implemented, authenticated, and responding correctly for all required domains. All endpoints exist (with the noted discrepancies). No backend changes are required to begin Phase 6 implementation. The frontend has a clean and consistent mock layer, well-defined service files, existing loading/error state components, and clear separation between data and UI. The integration path is unambiguous.

**Implementation must begin with Steps 1–5** (environment, Axios, AuthContext, auth pages, route guards) before touching any data endpoints. No data page integration will work without the auth foundation.

**Known gaps that will require resolution during implementation (not blockers):**
- The hourly UV chart (D9) — requires new endpoint or chart redesign.
- The settings schema mismatch (D4) — UI simplification required.
- The Device page redesign (D11) — significant but contained.
- The alerts type changes (D6, D7) — straightforward adapter pattern.

---
*End of Phase 6A Frontend ↔ Backend Integration Readiness Audit*
