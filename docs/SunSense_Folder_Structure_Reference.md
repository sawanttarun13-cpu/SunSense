# SunSense Project Folder Structure Reference

This document provides a comprehensive overview of the entire SunSense repository, including the React frontend, Express backend, and PostgreSQL database layers.

---

## 📁 Root Directory

```
SunSense/
├── package.json              # Frontend npm dependencies and scripts (Vite, React)
├── tsconfig.json             # TypeScript configuration for the frontend
├── vite.config.ts            # Vite bundler configuration
├── tailwind.config.js        # Tailwind CSS configuration and theme extensions
├── index.html                # Main HTML entry point for the React application
├── Final_Roadmap.md          # The official locked project roadmap and status tracker
└── docs/                     # Project documentation (architecture, business logic, rules)
```

---

## 🎨 Frontend (`src/`)

The frontend is a React application built with TypeScript, Vite, and Tailwind CSS. It currently uses mock data services that will be wired to the real backend in Phase 6.

```
src/
├── main.tsx                  # React application mount point
├── App.tsx                   # Main routing component (defines all pages and layouts)
│
├── assets/                   # Static assets like images, icons, and SVG files
│
├── components/               # Reusable React components
│   ├── charts/               # Recharts components (e.g., Tooltips for historical graphs)
│   ├── common/               # Shared UI (StatCard, UVGauge, LoadingState, ErrorState)
│   ├── dashboard/            # Dashboard specific widgets (SunscreenTracker, Modal)
│   ├── figma/                # Generated/cloned components matching the Figma design
│   ├── layout/               # Page wrappers (MainLayout, AuthLayout, Sidebar)
│   └── ui/                   # Shadcn UI base components (buttons, dialogs, inputs, forms)
│
├── constants/                # Hardcoded UI constants (navigation links, UV scale colors)
│
├── context/                  # React Context providers (AppContext for global state)
│
├── hooks/                    # Custom React hooks (useUVData, useSunscreen)
│
├── mockData/                 # (Phase 2) Hardcoded JSON data to build the UI before APIs
│
├── pages/                    # Top-level route components (Dashboard, History, Settings, etc.)
│
├── services/                 # Frontend service layer (currently returning mockData, will use Axios)
│
├── styles/                   # CSS stylesheets (Tailwind imports, global overrides, fonts)
│
├── types/                    # Frontend TypeScript interfaces (mirrors backend request/response models)
│
└── utils/                    # Helper functions (date formatting, color calculations)
```

---

## ⚙️ Backend (`backend/`)

The backend is an Express Node.js application built with TypeScript following a strict layered architecture: **Controllers → Services → Repositories → Prisma**.

```
backend/
├── package.json              # Backend npm dependencies (Express, Prisma, bcrypt, zod)
├── tsconfig.json             # TypeScript configuration for the backend
├── .env                      # Environment variables (Database URL, JWT secrets)
│
├── prisma/                   # Database Layer
│   ├── schema.prisma         # The single source of truth for the database schema (10 tables)
│   ├── seed.ts               # Script to populate the database with test data
│   └── migrations/           # Auto-generated SQL files tracking database changes
│
└── src/                      # Backend Source Code
    ├── server.ts             # Application entry point (starts the HTTP server on port 5000)
    ├── app.ts                # Express app configuration (mounts middlewares and all routes)
    │
    ├── config/               # Configuration files (environment variables parser, Prisma singleton)
    │
    ├── controllers/          # API Route Handlers (Extracts req body, calls services, sends res)
    │   ├── auth/             # Login, Register, Profile
    │   ├── device/           # ESP8266 registration and heartbeat
    │   ├── readings/         # Ingesting UV data from the ESP8266
    │   └── ...               # (Alerts, Analytics, Dashboard, History, Settings, Sunscreen)
    │
    ├── middleware/           # Request interceptors
    │   ├── requireAuth.ts    # Validates JWT access tokens for protected routes
    │   ├── requireDeviceAuth # Validates API keys for ESP8266 device endpoints
    │   ├── validateRequest   # Uses Zod schemas to validate incoming request bodies
    │   ├── rateLimiter.ts    # Prevents spam/DDoS on auth and global routes
    │   └── errorHandler.ts   # Catches and formats global errors
    │
    ├── models/               # Zod validation schemas (ensures API payloads are strictly typed)
    │
    ├── repositories/         # Database Access Layer (The ONLY place Prisma queries are allowed)
    │   ├── exposure.repo.ts  # Database operations for Exposure Sessions
    │   ├── reading.repo.ts   # Database operations for UV Readings
    │   └── ...               # (User, Device, Alerts, Analytics, History, Profile, Settings)
    │
    ├── routes/               # Express Router definitions (maps HTTP verbs/paths to controllers)
    │
    ├── services/             # Business Logic Layer (The ONLY place business rules exist)
    │   ├── calculation/      # Pure math: SED, Burn Time, Risk Level, Preferred SPF
    │   ├── exposure/         # Logic for creating and ending exposure sessions
    │   ├── ingestion/        # Logic for accepting raw device readings and triggering calculations
    │   └── ...               # (Auth, Dashboard aggregation, Analytics formatting, etc.)
    │
    └── utils/                # Backend helpers (Logger, API Response formatter, DB Health check)
```

---

## 🗄️ Database (PostgreSQL)

The database is defined in `backend/prisma/schema.prisma` and consists of 10 tables:

1. **`users`**: Account details and basic skin type.
2. **`devices`**: The ESP8266 hardware assigned to a user.
3. **`device_tokens`**: Hashed API keys for secure device authentication.
4. **`uv_readings`**: Raw, granular UV index data sent by the device every few seconds/minutes.
5. **`exposure_sessions`**: Calculated periods of sun exposure (aggregates UV readings to calculate SED and Risk).
6. **`sunscreen_applications`**: Tracks when sunscreen was applied and when it expires.
7. **`alerts`**: Smart notifications generated by the system (e.g., "Burn Warning", "Reapply Sunscreen").
8. **`settings`**: User dashboard configurations and threshold limits.
9. **`notification_preferences`**: Toggles for email/push and quiet hours.
10. **`device_sync_logs`**: Audit trail for when the ESP8266 pushes data (especially after being offline).

---

## 📜 Documentation (`docs/`)

The `docs/` folder contains the architectural blueprints for the project. These files represent the **Single Source of Truth** for the system's design.

```
docs/
├── backend/
│   ├── 01_System_Architecture.md        # High-level component interactions
│   ├── 02_Database_Design.md            # Schema definitions
│   ├── 03_ER_Diagram.md                 # Entity relationship visualization
│   ├── 04_Authentication.md             # JWT and Device API Key flows
│   ├── 05_REST_API.md                   # Endpoint contracts
│   ├── 07_Business_Logic.md             # Core logic overview
│   └── business-logic/                  # Deep-dives into every mathematical formula (SED, Burn Time, etc)
```
