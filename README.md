# SunSense Project

This is the main repository for the SunSense IoT UV Tracking Dashboard.

## 🚨 CRITICAL PROJECT ROADMAP
**DO NOT CHANGE THE PHASE ORDER WITHOUT EXPLICIT PROJECT OWNER APPROVAL.**

The single source of truth and authoritative roadmap for this project is located at:
👉 **[docs/SUNSENSE_FINAL_ROADMAP.md](./docs/SUNSENSE_FINAL_ROADMAP.md)**

All future AI agents and developers MUST read the final roadmap before modifying this repository, and MUST strictly follow the designated phase order.

---

## Running the Code

### Frontend
```bash
npm i
npm run dev
```

### Backend
```bash
cd backend
npm i
npx prisma generate
npm run dev
```

---

## API Client Architecture (Phase 6B)

### Environment Setup

Before running the frontend, create a `.env` file in the project root:

```bash
cp .env.example .env
```

`.env` must contain:

```
VITE_API_URL=http://localhost:5000/api/v1
```

> Never commit `.env`. It is listed in `.gitignore`.

### API Client Location

```
src/lib/apiClient.ts
```

This is the **single shared Axios instance** for the entire frontend.
All service files (`src/services/*.service.ts`) must import and use it.
No service file may create its own Axios instance.

### Token Architecture

| Token | Storage | Who sets it | Who reads it |
|---|---|---|---|
| Access token (JWT, 15 min) | In-memory only (`_accessToken`) | `AuthContext.login()` (Phase 6C) | Request interceptor |
| Refresh token (JWT, 7 days) | HttpOnly cookie (set by backend) | Backend `/auth/login` | Browser (automatic) |

The refresh token is **never accessible to JavaScript**. The browser sends it automatically on every request because `withCredentials: true` is set on the Axios instance.

### Silent Token Refresh

When any API call returns HTTP 401:

1. The response interceptor calls `POST /api/v1/auth/refresh`.
2. The browser sends the HttpOnly `refreshToken` cookie automatically.
3. On success: the new access token is stored in memory; the original request is retried once.
4. On failure: `clearAccessToken()` is called; `AuthContext` (Phase 6C) redirects to `/login`.
5. A `_retry` flag prevents infinite loops.

### Error Normalization

All errors thrown by service files are `AppError` objects (from `src/lib/apiClient.ts`):

```typescript
interface AppError {
  message:     string;   // Human-readable message
  status:      number;   // HTTP status (0 = network error)
  isNetwork:   boolean;  // true if request never reached server
  isAuth:      boolean;  // true for 401
  isForbidden: boolean;  // true for 403
  validation?: unknown;  // Zod error details (if backend provided)
}
```

### How to Use in a Service File

```typescript
import apiClient, { normalizeError } from '../lib/apiClient';
import type { ApiResponse } from '../types/api';

export const myService = {
  getData: async () => {
    try {
      const res = await apiClient.get<ApiResponse<MyType>>('/my-endpoint');
      return res.data.data;
    } catch (err) {
      throw normalizeError(err);
    }
  },
};
```