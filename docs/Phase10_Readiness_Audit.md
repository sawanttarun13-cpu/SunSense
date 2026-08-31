# Phase 10 Readiness Audit

## Goal
Audit the current repository against the authoritative Phase 10 requirements to determine which alert infrastructure already exists and what actual Smart Alert Engine logic is still missing.

## Authoritative Roadmap Source
`docs/SUNSENSE_FINAL_ROADMAP.md` designates Phase 10 as **"Alerts"** (previously documented in `Final_Roadmap.md` as "Phase 8 — Smart Alert Engine").

## 1. Existing Alert Backend Audit
- **Prisma Model**: `Alert` model exists with fields `id`, `userId`, `type` (enum `AlertType`), `message`, `triggeredAt`, `isRead`, `isDismissed`.
- **Alert Types**: Prisma `AlertType` enum currently supports only: `BURN_WARNING`, `REAPPLY_SUNSCREEN`, `DAILY_LIMIT`, `OFFLINE_SYNC`, `BATTERY_LOW`.
- **Repositories & Services**: `alerts.repo.ts`, `alerts.service.ts` exist. They provide paginated reads and marking alerts as read/dismissed.
- **Controllers & Routes**: `alerts.controller.ts` and `alerts.routes.ts` are implemented.
- **Event Transport**: `realtime.service.ts` has `getIO().to(user).emit('alert:new', alert)`, but it is never called.
- **Notification Settings**: `NotificationPreference` model exists with `emailNotifications`, `pushNotifications`, `smartAlertPreferences`, `reminderPreferences`, `quietHoursStart`, `quietHoursEnd`. However, there is no actual delivery integration (e.g., SendGrid, APNs/FCM).

## 2. Existing Alert Frontend Audit
- **Alerts Page**: `Alerts.tsx` exists and displays active/dismissed alerts using pagination, with severity coloring.
- **Dashboard Count**: Active alert count is implemented via REST polling.
- **Socket Subscription**: The frontend type definition (`socket.types.ts`) includes `alert:new`, but **no active socket listener exists** in `Alerts.tsx` or `Dashboard.tsx` for real-time alert popups. It currently relies on `exposure:updated` to trigger a REST refetch.

## 3. Input Data Readiness
- **Current UV & SED**: Available via `uv_readings` and `exposure_sessions`.
- **Skin Type / Preferred SPF**: Stored in `User` profile. `CalculationService` correctly implements `calculateUnprotectedBurnTime(uv, skinType)` and `calculateProtectedBurnTime(burnTime, spf)`.
- **Sunscreen Data**: `SunscreenApplication` model tracks `appliedSpf`, `appliedAt`, and `expiresAt` (hardcoded to +120 mins).
- **Thresholds**: User `Setting` stores `alertThreshold` (default 6.0).

## 4. Phase 10 Smart Alert Types (Roadmap vs Prisma)
The roadmap lists the following alerts for the engine.
| Roadmap Requirement | Prisma Enum Exists? |
|---|---|
| Rapid UV Increase | MISSING |
| High Risk | MISSING |
| Extreme UV | MISSING |
| SPF Reminder | MISSING |
| Sunscreen Expiring | `REAPPLY_SUNSCREEN` |
| Daily Dose Limit | `DAILY_LIMIT` |
| Battery Low | `BATTERY_LOW` |
| Device Offline | MISSING |
| Sensor Covered | MISSING |
| Peak UV Warning | `BURN_WARNING` (Proxy) |

## 5. Roadmap vs Repository Table

| Phase 10 Requirement | Existing? | File(s) | Missing Work |
|---|---|---|---|
| Alert Database / Prisma Schema | COMPLETE | `schema.prisma` | Expand `AlertType` enum. |
| Alert CRUD API | COMPLETE | `alerts.service.ts`, `alerts.controller.ts` | None |
| Alert Frontend UI | COMPLETE | `Alerts.tsx` | Wire up `alert:new` socket listener. |
| Smart Alert Engine (Producer) | MISSING | N/A | Entire worker/service to analyze readings and create alerts automatically. |
| Duplicate / Cooldown Protection | MISSING | `schema.prisma` | Add cooldown logic/unique constraints to prevent spamming alerts every 10 seconds. |
| Real-time Socket Transport | PARTIAL | `realtime.service.ts` | Backend triggers it; frontend needs to listen for it. |
| Email / Push Notification Delivery | MISSING | N/A | Implement actual delivery providers based on preferences. |

## 6. Phase 10 Dependencies
- **Engine Code**: Can be implemented immediately without a calibrated sensor.
- **Physical Validation**: **Requires S12SD Final Calibration.** Testing real-world threshold alerts (e.g., Extreme UV) requires accurate UVI outputs to prevent false positives and validate the engine.

---

**OFFICIAL PHASE 10:**
Alerts / Smart Alert Engine

**PHASE 10 REQUIREMENTS TOTAL:**
7 (Core Architectural Components)

**ALREADY COMPLETE:**
3

**PARTIALLY COMPLETE:**
1

**MISSING:**
3

**ALERT DATABASE/API:**
READY

**ALERT FRONTEND:**
READY (Requires socket listener hookup)

**SOCKET ALERT TRANSPORT:**
PARTIAL

**AUTOMATIC ALERT PRODUCER:**
MISSING

**DUPLICATE/COOLDOWN PROTECTION:**
MISSING

**SUNSCREEN ALERT DATA:**
READY

**BURN-TIME ALERT DATA:**
READY

**DAILY DOSE ALERT DATA:**
READY

**S12SD CALIBRATION REQUIRED FOR CODE IMPLEMENTATION:**
NO

**S12SD CALIBRATION REQUIRED FOR FINAL PHYSICAL VALIDATION:**
YES

**PHASE 10 STATUS:**
PARTIALLY COMPLETE (Infrastructure exists; Engine logic missing)

**REMAINING PHASE 10 WORK:**
- Expand Prisma `AlertType` enum.
- Add cooldown/duplicate protection (e.g., deduplication key or active state) to `Alert` model.
- Implement the `SmartAlertEngineService` (the producer) to evaluate readings, UV bounds, burn-time, and sunscreen limits.
- Wire `SmartAlertEngineService` into the ingestion pipeline (`ExposureLogicService`).
- Connect frontend socket listener for `alert:new` to show toast notifications.
- (Optional depending on scope) Implement push/email delivery handlers.

**READY TO IMPLEMENT:**
YES (Code can be written; final tuning deferred until calibration)

**BLOCKERS:**
NONE
