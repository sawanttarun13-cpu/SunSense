# SunSense — Folder Structure & File Reference Guide

**Purpose:** This document explains every folder and file in the SunSense project in plain language.
It is written for someone who is learning while building, so every section explains the **why** (purpose),
the **what** (contents), and the **how** (how it connects to other parts).

---

## 🗂️ Root Level — `d:\SunSense\SunSense\`

These are the files at the top level of your project, outside of `src/`.

| File / Folder | Purpose |
|---|---|
| `src/` | All your React application source code lives here |
| `docs/` | Project documentation and phase walkthroughs |
| `dist/` | The compiled/built version of the app (auto-generated, don't edit) |
| `node_modules/` | All installed packages (auto-generated, don't edit) |
| `package.json` | Lists all dependencies (libraries) the project uses, and the build scripts |
| `vite.config.ts` | Configuration for Vite (the tool that runs the dev server and builds the app) |
| `index.html` | The single HTML page that React mounts into — the entry point for the browser |
| `pnpm-lock.yaml` | Exact versions of all installed packages (managed by pnpm, don't edit manually) |
| `SunSense_Master_Project_Reference.md` | ✅ The single source of truth for the entire project |
| `SunSense_Project_Charter_Rules_Phase_Roadmap_v2.md` | Original project charter |

---

## 📁 `src/` — Source Code Root

This is where ALL your application code lives. Everything inside here is organized by purpose.

```
src/
├── App.tsx
├── main.tsx
├── assets/
├── components/
│   ├── charts/
│   ├── common/
│   ├── figma/
│   ├── layout/
│   └── ui/
├── constants/
├── context/
├── hooks/
├── mockData/
├── pages/
├── styles/
├── types/
└── utils/
```

---

## 📄 `src/main.tsx`

**What it is:** The very first file that runs when the app starts.

**What it does:** It takes your `App` component and "mounts" (attaches) it to the HTML page.
Think of it as the ignition key that starts the whole engine.

```tsx
// It finds the <div id="root"> in index.html and puts the React app inside it.
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

**Rule:** You rarely need to touch this file unless you're adding a global Provider (like a theme or auth context).

---

## 📄 `src/App.tsx`

**What it is:** The routing hub of the entire application.

**What it does:** It defines which URL shows which page. It uses React Router.

```
/login      → Login page
/register   → Register page
/dashboard  → Dashboard page (inside MainLayout)
/analytics  → Analytics page (inside MainLayout)
/history    → History page (inside MainLayout)
/alerts     → Alerts page (inside MainLayout)
/device     → Device page (inside MainLayout)
/settings   → Settings page (inside MainLayout)
/profile    → Profile page (inside MainLayout)
```

**Rule:** If you add a new page, you register its route here.

---

## 📁 `src/pages/` — The 9 Application Pages

Each file in this folder is one full screen that the user sees.
Pages are assembled from smaller components (from `components/`), and they import data from `mockData/`.

| File | What the User Sees |
|---|---|
| `Dashboard.tsx` | Live UV index gauge, stat cards, hourly chart |
| `Analytics.tsx` | Weekly/monthly charts, peak hours, 91-day heatmap |
| `History.tsx` | Searchable/filterable table of all UV log entries |
| `Alerts.tsx` | Timeline of UV event alerts with severity badges |
| `Device.tsx` | Hardware status — battery, Wi-Fi, sensors, last sync |
| `Profile.tsx` | User profile, Fitzpatrick skin type selector, achievements |
| `SettingsPage.tsx` | SPF level, UV alert threshold, notifications, theme |
| `Login.tsx` | Sign-in form with email + password |
| `Register.tsx` | Account creation form |

**Think of pages like:** Rooms in a building. The Sidebar is the hallway you use to navigate between rooms.

---

## 📁 `src/components/` — Reusable UI Building Blocks

Components are small, focused pieces of UI that pages are built from.
A component is written **once** and can be used in **many pages**.

---

### 📁 `src/components/common/` — Shared UI Widgets

These are the most frequently reused visual pieces across multiple pages.

| File | What it Does |
|---|---|
| `StatCard.tsx` | A white card showing an icon, label, value, and optional delta (e.g. "Battery 82% ↑+18m"). Used on Dashboard, Profile. |
| `MiniMetric.tsx` | A compact card showing a big number and a colored progress bar underneath (e.g. "Peak UV Today: 9.3"). Used on Dashboard. |
| `UVGauge.tsx` | The semicircular UV index gauge needle display. The most visually distinctive component in the app. Used on Dashboard. |

**Rule:** If a UI widget appears on more than one page, it belongs here.

---

### 📁 `src/components/layout/` — App Shell / Page Frame

These wrap all the content pages and provide the common structure.

| File | What it Does |
|---|---|
| `MainLayout.tsx` | Wraps all authenticated pages. Contains the Sidebar on the left and a content area on the right. Uses React Router's `<Outlet />` to render whichever page is active. |
| `Sidebar.tsx` | The dark navy navigation panel on the left. Shows logo, live UV status pill, nav links, and logout button. Collapses to icon-only mode on click. Handles mobile drawer too. |
| `AuthLayout.tsx` | Wraps the Login and Register pages. Shows the left blue branding panel and the right white form area. |

**Rule:** Never put page-specific logic in layout files.

---

### 📁 `src/components/charts/` — Chart-Specific Components

| File | What it Does |
|---|---|
| `ChartTooltip.tsx` | The popup that appears when you hover over a point on the UV area chart. It shows the UV value and zone label in the zone's colour. |

**Rule:** Chart sub-components (tooltips, custom dots, legends) go here.

---

### 📁 `src/components/ui/` — shadcn/Radix UI Primitives

This folder contains low-level UI building blocks (buttons, dialogs, dropdowns, etc.) that come from the **shadcn/ui** library.
These are pre-built, accessible components that follow design system conventions.

**Rule:** Don't edit these files manually. They are library-generated. Use them by importing into your own components.

---

### 📁 `src/components/figma/` — Original Figma Export

These are the original components generated directly from the Figma design export.
They are kept for reference to the original design intent.

**Rule:** Do not use these in new development. They have been replaced by the refactored components.

---

## 📁 `src/types/` — TypeScript Type Definitions

TypeScript lets you define the **shape** (structure) of your data before you use it.
This prevents bugs like trying to access a property that doesn't exist.

| File | What it Defines |
|---|---|
| `uv.ts` | `UVZone` interface (the shape of each UV zone: label, colour, bg, border, text) and `UVReading` type (hour + uv value). |
| `alert.ts` | `AlertSeverity` type (the 5 levels: extreme, critical, warning, info, resolved), `AlertItem` interface (one alert row), `SeverityStyle` interface (the colours for each severity level). |
| `profile.ts` | `SkinType` interface (Fitzpatrick scale entries), `SensitivityLevel` interface, `Achievement` interface. |

**Real-world analogy:** Types are like a form template. They say "this data MUST have these fields, with these data types". If you send the wrong shape of data, TypeScript warns you **before** the app even runs.

**Rule:** Every piece of data that flows through the app should have a type defined here.

---

## 📁 `src/constants/` — Fixed Application-Wide Values

Constants are values that **never change at runtime** — they are fixed business logic values.

| File | What it Contains |
|---|---|
| `uv.ts` | `UV_ZONES` array — the 5 UV zones (Low, Moderate, High, Very High, Extreme) with their threshold values, labels, and colours. Also exports `getUVZone(value)` — a function that takes a UV number and returns which zone it belongs to. |
| `navigation.ts` | `navItems` array — the 7 sidebar navigation links (id, label, icon, optional badge). |
| `settings.ts` | `SPF_OPTS` array (15, 30, 50, 100) and `THEME_OPTS` array (Light, Dark, System). |

**Real-world analogy:** Constants are like a rulebook. The UV thresholds don't change daily — they are scientific standards. Putting them here means if the standard ever changes, you update it in ONE place and it fixes everywhere automatically.

**Rule:** If a value appears in multiple files or represents a business rule, it belongs in `constants/`.

---

## 📁 `src/mockData/` — Temporary Fake Data (To Be Replaced by API)

During development, before the backend exists, we use realistic fake data so the UI looks real.
These files will be **replaced** by actual API calls in Phase 6.

| File | What it Contains |
|---|---|
| `analytics.ts` | `weeklyData`, `monthlyData`, `peakHoursData`, `heatmapData` — the chart data for the Analytics page. Also includes `heatFillColor()` and `heatColor()` helpers. |
| `alerts.ts` | `ALERT_DATA` — the 10 sample alert entries. `SEVERITY_STYLES` — the colour mappings for each severity level. `FILTER_TABS` — the filter button definitions. |
| `history.ts` | `ALL_LOGS` — 72 generated UV log entries. `fmtDate()`, `fmtTime()`, `fmtDuration()` format helpers. `exportCSV()` function for CSV download. `LEVEL_OPTS`, `PAGE_SIZE` constants. |
| `profile.ts` | `SKIN_TYPES` — 6 Fitzpatrick skin type entries. `SENSITIVITY_LEVELS` — 5 UV sensitivity levels. `ACHIEVEMENTS` — 8 user achievement entries. |

**Real-world analogy:** Mock data is like a movie prop. It looks real on screen but doesn't do real things yet. Once the real backend is built (Phase 4/5), we swap in real data from the database.

**Rule:** Never use mock data in production. It must all be replaced by API calls before deployment.

---

## 📁 `src/hooks/` — Custom React Hooks

A "hook" is a reusable piece of logic that uses React features (like `useState` and `useEffect`).
You extract logic into a hook so multiple components can share the same behaviour.

| File | What it Does |
|---|---|
| `useUVData.ts` | Manages the **live UV simulation** on the Dashboard. It generates hourly UV data, updates the UV value every 4 seconds (simulating a live sensor), and returns `{ uvValue, hourlyData, zone }` to any component that uses it. In Phase 6, this will be replaced by a real WebSocket connection. |

**Real-world analogy:** A hook is like a power outlet. Many devices (components) can plug into it (use it) and get electricity (the logic) without needing their own generator.

**Rule:** If a component has complex stateful logic (timers, data fetching, subscriptions), extract it into a custom hook here.

---

## 📁 `src/context/` — Global Application State

React Context lets you share data across many components **without passing props** through every level.

| File | What it Does |
|---|---|
| `AppContext.tsx` | A placeholder context that is ready to hold global state (e.g. the logged-in user, theme preference, or live UV value shared across all pages). Currently empty — will be populated in Phase 6/7 when authentication and real-time data are added. |

**Real-world analogy:** Context is like a radio broadcast. Instead of whispering information from parent to child to grandchild (prop drilling), you broadcast it on a frequency and any component that "tunes in" receives it directly.

**Rule:** Only put truly global state in Context (auth, theme, live device data). Local UI state stays in the component.

---

## 📁 `src/utils/` — Utility Functions

Utilities are pure helper functions that perform a calculation or transformation.
They have no React-specific code — they just take input and return output.

| File | What it Does |
|---|---|
| `uv.ts` | Currently a **re-export shim** — it re-exports `UV_ZONES` and `getUVZone` from `constants/uv.ts` for backward compatibility. All new code should import directly from `constants/uv`. |

**Rule:** Utilities must be pure functions (no side effects). If it's a React-specific behaviour, use a hook instead.

---

## 📁 `src/assets/` — Static Files

This folder holds static files that don't change — images, fonts, icons, logos, etc.
Currently empty and ready for use in future phases.

**Rule:** Never import assets from outside `src/assets/`. Keep them centralized.

---

## 📁 `src/styles/` — Global CSS Stylesheets

| File | What it Does |
|---|---|
| `globals.css` | Global CSS resets and base styles applied to the entire app |
| `tailwind.css` | Imports Tailwind CSS (the utility-class CSS framework used throughout) |
| `theme.css` | Custom CSS variables for the design system colours and tokens |
| `fonts.css` | Font imports (e.g. Poppins/Inter from Google Fonts) |
| `index.css` | Main CSS entry point that imports the others |

**Rule:** Use TailwindCSS utility classes for component styling. Only add to these files for truly global styles (body, fonts, CSS variables).

---

## 📁 `docs/walkthroughs/` — Phase Memory & Reference

| File | What it Contains |
|---|---|
| `README.md` | Index of all phase walkthrough files |
| `walkthrough_phase_X.md` | Full record of what was built, decisions made, and tests run in Phase X |

**Rule:** After every phase completes, a new walkthrough file is created here as permanent memory.

---

## 🔗 How Everything Connects — Data Flow Summary

```
User opens browser
       │
       ▼
index.html  →  main.tsx  →  App.tsx (routing)
                                  │
                    ┌─────────────┼──────────────┐
                    ▼             ▼               ▼
              MainLayout     AuthLayout      (future layouts)
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
       Sidebar           Page (e.g. Dashboard)
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
         components/       hooks/           mockData/
         common/           useUVData.ts     analytics.ts
         StatCard.tsx           │                │
         UVGauge.tsx            │                │
         MiniMetric.tsx         ▼                ▼
                          constants/uv.ts    types/uv.ts
```

**In Phase 6**, `mockData/` will be replaced by `services/` (Axios API calls to the backend).

---

## ✅ Quick Rules Summary

| Rule | Why |
|---|---|
| Pages use components, not the other way around | Keeps components reusable |
| Types define data shape before you use data | Prevents runtime bugs |
| Constants hold values that don't change | One place to update = no bugs |
| mockData is temporary | Real API calls replace it in Phase 6 |
| Hooks extract stateful logic from components | Logic can be shared and tested |
| Context holds global state only | Avoids unnecessary complexity |
| Utils are pure functions | Predictable, testable, no side effects |

---

*Document created: 2026-07-29 | Phase 1.5 Complete | SunSense Engineering Reference*
